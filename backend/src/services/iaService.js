import { env } from '../config/env.js'
import { TIPOS_INCIDENTE, TIPOS_REPORTE, etiquetaTipo } from '../config/fuente.js'
import { ErrorValidacion } from '../utils/texto.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_MENSAJES = 12
const MAX_CARACTERES = 600

// Prompt del plan (sección "Prompt del Sistema — Groq"), adaptado a la API de este backend.
const SYSTEM_PROMPT = `
Eres "Tu Vecino", un asistente de seguridad ciudadana para el distrito de Villa El Salvador, Lima, Perú.
Tu único trabajo es ayudar a vecinos a reportar incidentes de seguridad.

Cuando el vecino te cuente qué pasó:
1. Clasifica el tipo de incidente en una de estas categorías EXACTAS:
   ${TIPOS_REPORTE.join(' | ')}
2. Extrae o infiere la zona, calle o referencia si se menciona (si no, deja "").
3. Escribe una descripción breve y neutral (máximo 150 caracteres), sin datos personales.
4. Indica cuándo ocurrió si se menciona: "ahora", "hace_1h", "hoy" o "".
5. Responde SIEMPRE solo con este JSON:
   {"tipo":"...","descripcion":"...","zona":"...","cuando":"...","mensaje":"..."}
   donde "mensaje" es una respuesta corta, cálida y en lenguaje coloquial peruano que confirme lo que entendiste
   y pregunte si es correcto. Llama al usuario "vecino/a".

Si el mensaje no describe un incidente de seguridad, usa "tipo":"" y en "mensaje" pide amablemente que cuente qué pasó.
Si menciona una emergencia en curso (arma, herido, persona en peligro), en "mensaje" recomienda llamar al 105 primero.
`.trim()

// --- Clasificador local de respaldo (funciona sin conexión ni clave de API) -----------------

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const REGLAS = [
  ['intento_robo', /intent\w* (de )?(robar|asaltar|arrebat)|casi me roban|quisieron robar|trataron de robar/],
  ['robo', /\brob\w*|asalt\w*|arrebat\w*|carterista|me quitaron|se llevaron|hurt\w*|ladron\w*|choro\w*|marca(ron)?\b/],
  ['acoso', /acos\w*|me sigui\w*|siguiendo|piropo|manose\w*|toque\w*|exhibicion\w*|tocaron|obscen\w*|me miraba|me grit\w*|violencia|me pego|golpe/],
  ['zona_oscura', /oscur\w*|sin luz|sin ilumin\w*|poste\w*|alumbrado|apagad\w*|foco\w*/],
  ['espacio_abandonado', /abandonad\w*|terreno baldio|lote|botadero|casa vacia|basural|desmonte/],
  ['actividad_sospechosa', /sospech\w*|raro\w*|merodea\w*|droga\w*|fumando|tomando|borracho\w*|pandill\w*|grupo de|vigilando|extorsi\w*/],
]

const CUANDO = [
  ['ahora', /ahora|ahorita|en este momento|recien|acaba de/],
  ['hace_1h', /hace (un|1) (rato|hora)|hace poco|hace (\d+|unos) minutos/],
  ['hoy', /\bhoy\b|esta (manana|tarde|noche)|en la (manana|tarde|noche)/],
]

const ZONA_RE = /\b(?:en|por|cerca de|frente a|altura de|desde|de|del)\s+(?:la |el )?((?:av(?:enida)?\.?|jr\.?|jiron|calle|psje\.?|pasaje|parque|mercado|sector|grupo|paradero|colegio|mz\.?|plaza)\s+[\wÀ-ſ.°\s]{2,40}?)(?=[,;!?]|(?<!\b(?:av|jr|psje|mz|nro))\.(?:\s|$)|\s+(?:hace|ahora|ahorita|hoy|y |con |a las|cuando)|$)/i

function clasificarLocal(texto) {
  const t = sinTildes(texto)
  const tipo = REGLAS.find(([, re]) => re.test(t))?.[0] ?? ''
  const cuando = CUANDO.find(([, re]) => re.test(t))?.[0] ?? ''
  const zona = texto.match(ZONA_RE)?.[1]?.trim() ?? ''
  const descripcion = texto.replace(/\s+/g, ' ').trim().slice(0, 150)
  const emergencia = /\b(arma|pistola|cuchillo|herid\w*|sangr\w*|disparo\w*|balacera)\b/.test(t)

  let mensaje
  if (!tipo) {
    mensaje = 'Te escucho, vecino/a. ¿Me cuentas un poco más? Por ejemplo: qué pasó y por dónde fue.'
  } else {
    mensaje = `Entendido, vecino/a. Detecté: ${etiquetaTipo(tipo)}${zona ? ` en ${zona}` : ''}. ¿Es correcto?`
    if (emergencia) mensaje = `Si alguien está en peligro ahora mismo, llama primero al 105. ${mensaje}`
  }
  return { tipo, descripcion, zona, cuando, mensaje, motor: 'local' }
}

// --- Groq ---------------------------------------------------------------------------------

async function clasificarConGroq(mensajes) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.ia.groqApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.ia.modelo,
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...mensajes],
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Groq respondió ${res.status}`)
  const body = await res.json()
  const datos = JSON.parse(body.choices?.[0]?.message?.content ?? '{}')
  const tipo = TIPOS_REPORTE.includes(datos.tipo) ? datos.tipo : ''
  return {
    tipo,
    descripcion: String(datos.descripcion ?? '').slice(0, 150),
    zona: String(datos.zona ?? '').slice(0, 120),
    cuando: ['ahora', 'hace_1h', 'hoy'].includes(datos.cuando) ? datos.cuando : '',
    mensaje: String(datos.mensaje ?? '').slice(0, 400) || 'Cuéntame un poco más, vecino/a.',
    motor: 'groq',
  }
}

// Valida la conversación recibida del navegador y la clasifica.
export async function conversar(body) {
  const mensajes = Array.isArray(body.mensajes) ? body.mensajes.slice(-MAX_MENSAJES) : []
  const limpios = mensajes
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) }))
  const textoUsuario = limpios.filter((m) => m.role === 'user').map((m) => m.content).join('. ')
  if (!textoUsuario.trim()) throw new ErrorValidacion('Escribe qué pasó')

  if (env.ia.groqApiKey) {
    try {
      return await clasificarConGroq(limpios)
    } catch (err) {
      console.warn(`IA: Groq no disponible (${err.message}); se usa el clasificador local`)
    }
  }
  return clasificarLocal(textoUsuario)
}

export const tiposIncidente = () => TIPOS_INCIDENTE
