import { ReporteModel } from '../models/ReporteModel.js'
import { ComisariaModel } from '../models/ComisariaModel.js'
import { etiquetaTipo } from '../config/fuente.js'
import { distanciaMetros, puntoEnPoligono } from '../utils/geo.js'
import { ErrorValidacion } from '../utils/texto.js'
import { generarTextoGroq } from './iaService.js'

// Recomendación de seguridad personalizada según la ubicación del vecino.
// Junta los datos reales (reportes cercanos, horario, comisarías) y los redacta con IA (Groq)
// o, sin clave o sin conexión, con un redactor local equivalente.

const RADIO_M = 500
const DIAS = 30
const UMBRAL = { alto: 10, medio: 4 } // reportes en 500 m durante 30 días
const MAX_PALABRAS = 120

const ZONA = 'America/Lima'
const horaLima = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA, hour: '2-digit', hourCycle: 'h23' })
const relojLima = new Intl.DateTimeFormat('es-PE', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

const PROMPT = `Actúa como un asistente de seguridad ciudadana para la aplicación "Tu Vecino".

Recibirás información sobre la ubicación actual del usuario, incidentes cercanos, nivel de riesgo, horario actual y puntos seguros cercanos.

Tu tarea es generar una explicación breve, clara y útil para un ciudadano común.

Debes:

- Explicar el nivel de riesgo de la zona.
- Mencionar los factores que contribuyen al riesgo.
- Indicar horarios de mayor incidencia si existen.
- Recomendar acciones concretas para mantenerse seguro.
- Informar sobre los puntos seguros más cercanos.
- Utilizar lenguaje simple y no alarmista.
- Mantener la respuesta en menos de 120 palabras.

Datos:

Ubicación: {{ubicacion}}
Nivel de riesgo: {{riesgo}}
Incidentes últimos 30 días: {{incidentes}}
Horario actual: {{hora}}
Horario de mayor incidencia: {{horario_riesgo}}
Puntos seguros cercanos: {{puntos_seguros}}

Genera una recomendación personalizada.`

const rellenar = (plantilla, datos) => plantilla.replace(/\{\{(\w+)\}\}/g, (_, clave) => datos[clave] ?? '')

const formatoMetros = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 10) * 10} m`)
const dosDigitos = (h) => String(h % 24).padStart(2, '0')

// Ventana de 3 horas con más reportes (necesita al menos 2 en esa ventana).
function horarioPico(reportes) {
  if (reportes.length < 2) return null
  const porHora = Array(24).fill(0)
  for (const r of reportes) porHora[Number(horaLima.format(new Date(r.fechaHecho)))]++
  let mejor = { inicio: 0, total: 0 }
  for (let h = 0; h < 24; h++) {
    const total = porHora[h] + porHora[(h + 1) % 24] + porHora[(h + 2) % 24]
    if (total > mejor.total) mejor = { inicio: h, total }
  }
  if (mejor.total < 2) return null
  return { inicio: mejor.inicio, fin: (mejor.inicio + 3) % 24, total: mejor.total, texto: `${dosDigitos(mejor.inicio)}:00 a ${dosDigitos(mejor.inicio + 3)}:00` }
}

const dentroDe = (hora, pico) =>
  pico && (pico.inicio < pico.fin ? hora >= pico.inicio && hora < pico.fin : hora >= pico.inicio || hora < pico.fin)

async function analizar(lat, lng) {
  const [reportes, comisarias] = await Promise.all([ReporteModel.listarRecientes({ dias: DIAS }), ComisariaModel.listar()])
  const cercanos = reportes.filter((r) => distanciaMetros(lat, lng, r.lat, r.lng) <= RADIO_M)
  const n = cercanos.length
  const riesgo = n >= UMBRAL.alto ? 'alto' : n >= UMBRAL.medio ? 'medio' : 'bajo'

  const conteo = new Map()
  for (const r of cercanos) conteo.set(r.tipo, (conteo.get(r.tipo) ?? 0) + 1)
  const tipos = [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, total]) => ({ tipo, label: etiquetaTipo(tipo), total }))

  const pico = horarioPico(cercanos)
  const ahora = new Date()
  const horaActual = Number(horaLima.format(ahora))

  const puntosSeguros = comisarias
    .map((c) => ({ nombre: c.nombre, lat: c.lat, lng: c.lng, distancia: Math.round(distanciaMetros(lat, lng, c.lat, c.lng)) }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, 2)

  return {
    lat, lng, riesgo, radioMetros: RADIO_M, dias: DIAS,
    incidentes: n,
    tipos,
    horaActual: relojLima.format(ahora),
    horarioRiesgo: pico?.texto ?? null,
    enHorarioRiesgo: Boolean(dentroDe(horaActual, pico)),
    esDeNoche: horaActual >= 19 || horaActual < 6,
    puntosSeguros,
  }
}

function datosParaPrompt(a) {
  const ref = a.puntosSeguros[0]
  const detalleTipos = a.tipos.length ? ` (${a.tipos.map((t) => `${t.total} de ${t.label.toLowerCase()}`).join(', ')})` : ''
  return {
    ubicacion: `Villa El Salvador${ref ? `, a ${formatoMetros(ref.distancia)} de ${ref.nombre}` : ''} (radio de ${a.radioMetros} m)`,
    riesgo: a.riesgo,
    incidentes: `${a.incidentes} reportes vecinales${detalleTipos}`,
    hora: a.horaActual,
    horario_riesgo: a.horarioRiesgo ?? 'sin un horario marcado',
    puntos_seguros: a.puntosSeguros.map((p) => `${p.nombre} (${formatoMetros(p.distancia)})`).join('; ') || 'ninguno registrado cerca',
  }
}

// --- Redactor local (sin IA): mismas reglas del prompt, siempre < 120 palabras -------------
const CONSEJO_POR_TIPO = {
  robo: 'lleva el celular guardado y evita mostrar objetos de valor',
  intento_robo: 'camina atento a tu entorno y lleva tus cosas delante de ti',
  acoso: 'muévete por calles concurridas y, si te sientes en riesgo, pide ayuda o llama a la Línea 100',
  actividad_sospechosa: 'evita grupos o lugares que te generen desconfianza y reporta lo que veas',
  zona_oscura: 'prefiere calles iluminadas y usa la linterna del celular si es necesario',
  espacio_abandonado: 'evita atravesar terrenos o espacios abandonados',
  otro: 'mantente atento a tu entorno',
}

function redactarLocal(a) {
  const frases = []
  const intro = {
    alto: `Esta zona tiene un riesgo alto: hubo ${a.incidentes} reportes vecinales a menos de ${a.radioMetros} m en los últimos ${a.dias} días.`,
    medio: `Esta zona tiene un riesgo medio: hubo ${a.incidentes} reportes vecinales cerca en los últimos ${a.dias} días.`,
    bajo: a.incidentes
      ? `Esta zona tiene un riesgo bajo: solo ${a.incidentes === 1 ? 'hubo 1 reporte' : `hubo ${a.incidentes} reportes`} cerca en los últimos ${a.dias} días.`
      : `Esta zona tiene un riesgo bajo: no hay reportes vecinales cerca en los últimos ${a.dias} días.`,
  }[a.riesgo]
  frases.push(intro)
  const principales = a.tipos.filter((t) => t.tipo !== 'otro').slice(0, 2)
  if (principales.length) {
    frases.push(`Lo más reportado: ${principales.map((t) => t.label.toLowerCase()).join(' y ')}.`)
  }
  if (a.horarioRiesgo) {
    const [desde, hasta] = a.horarioRiesgo.split(' a ')
    frases.push(`Los incidentes se concentran entre las ${desde} y las ${hasta}${a.enHorarioRiesgo ? ', y ahora estás en ese horario' : ''}.`)
  }
  const consejos = principales.map((t) => CONSEJO_POR_TIPO[t.tipo])
  if (a.esDeNoche || a.enHorarioRiesgo) consejos.push('si puedes, camina acompañado')
  if (!consejos.length) consejos.push('mantente atento a tu entorno como de costumbre')
  frases.push(`Te recomendamos: ${consejos.join('; ')}.`)
  const p = a.puntosSeguros[0]
  if (p) frases.push(`Punto seguro más cercano: ${p.nombre}, a ${formatoMetros(p.distancia)}.`)
  frases.push('Ante una emergencia, llama al 105.')
  return recortar(frases.join(' '))
}

function recortar(texto) {
  const palabras = texto.trim().split(/\s+/)
  if (palabras.length < MAX_PALABRAS) return texto.trim()
  return palabras.slice(0, MAX_PALABRAS - 1).join(' ').replace(/[,;:]?$/, '…')
}

export async function obtenerRecomendacion(query) {
  const lat = Number(query.lat)
  const lng = Number(query.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ErrorValidacion('Indica tu ubicación (lat y lng)')
  if (!puntoEnPoligono(lat, lng)) throw new ErrorValidacion('Tu ubicación está fuera de Villa El Salvador')

  const analisis = await analizar(lat, lng)
  let texto = null
  let motor = 'local'
  const ia = await generarTextoGroq(rellenar(PROMPT, datosParaPrompt(analisis)), { maxTokens: 260 })
  if (ia) {
    texto = recortar(ia)
    motor = 'groq'
  }
  return { ...analisis, texto: texto ?? redactarLocal(analisis), motor }
}
