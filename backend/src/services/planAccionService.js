import { obtenerPredicciones } from './prediccionService.js'
import { generarTextoGroq } from './iaService.js'
import { env } from '../config/env.js'

// Plan de acción recomendado a partir de las predicciones.
// 1) Siempre hay un plan base por reglas (la demo nunca se rompe).
// 2) Si hay clave de Groq, la IA SOLO redacta la justificación de cada zona con los datos calculados.
//    Un control automático descarta cualquier texto con cifras que no estén en los datos.
// La IA propone; el funcionario acepta, edita o descarta en la interfaz.

const MAX_ZONAS = 5
const CACHE_MS = 60_000

const RESPONSABLE = {
  serenazgo: 'Serenazgo · Gerencia de Seguridad Ciudadana',
  pnp: 'Gerencia de Seguridad Ciudadana con la comisaría PNP del sector',
  genero: 'Equipo de igualdad de género (DEMUNA / CEM)',
  obras: 'Subgerencia de Obras y Mantenimiento',
  limpieza: 'Gerencia de Servicios a la Ciudad',
  participacion: 'Subgerencia de Participación Vecinal',
}

const fraseFranja = (z) => (z.franja ? ` en la franja de ${z.franja.label.toLowerCase()}` : '')

// Plantillas por tipo de incidente más probable.
const PLANTILLAS = {
  robo: (z) => [
    { titulo: `Reforzar patrullaje de serenazgo${fraseFranja(z)}`, responsable: RESPONSABLE.serenazgo, plazo: 'Esta semana', recurso: '1 unidad móvil y 2 serenos por turno', impacto: 'Presencia disuasiva donde se concentran los reportes de robo' },
    { titulo: 'Coordinar operativo conjunto con la PNP', responsable: RESPONSABLE.pnp, plazo: '15 días', recurso: 'Reunión de coordinación y 1 operativo', impacto: 'Intervención focalizada en los puntos con más reportes' },
  ],
  intento_robo: (z) => [
    { titulo: `Patrullaje preventivo${fraseFranja(z) || ' en horas punta'}`, responsable: RESPONSABLE.serenazgo, plazo: 'Esta semana', recurso: '1 unidad móvil en la franja indicada', impacto: 'Evitar que los intentos se conviertan en robos' },
    { titulo: 'Punto de vigilancia en paraderos y salidas de mercado', responsable: RESPONSABLE.serenazgo, plazo: '15 días', recurso: '1 sereno a pie', impacto: 'Disuasión en los lugares de mayor tránsito' },
  ],
  acoso: (z) => [
    { titulo: 'Campaña de prevención del acoso en la zona', responsable: RESPONSABLE.genero, plazo: '30 días', recurso: 'Material informativo y 2 jornadas en espacio público', impacto: 'Más vecinas informadas y más reportes de casos que hoy no se cuentan' },
    { titulo: 'Difundir la ruta de atención (CEM y Línea 100)', responsable: RESPONSABLE.genero, plazo: 'Esta semana', recurso: 'Afiches con la Línea 100 en paraderos y parques', impacto: 'Que quien sufra acoso sepa dónde pedir ayuda' },
    { titulo: `Patrullaje con enfoque de género${fraseFranja(z)}`, responsable: RESPONSABLE.serenazgo, plazo: '15 días', recurso: 'Serenos capacitados en atención a víctimas', impacto: 'Respuesta oportuna y sin revictimización' },
  ],
  actividad_sospechosa: (z) => [
    { titulo: `Ronda conjunta serenazgo–PNP${fraseFranja(z)}`, responsable: RESPONSABLE.pnp, plazo: '15 días', recurso: '1 ronda semanal', impacto: 'Verificar en campo lo que reportan los vecinos' },
    { titulo: 'Reunión con la junta vecinal del sector', responsable: RESPONSABLE.participacion, plazo: '30 días', recurso: '1 reunión vecinal', impacto: 'Información de primera mano y vigilancia vecinal organizada' },
  ],
  zona_oscura: () => [
    { titulo: 'Inspección y reparación del alumbrado público', responsable: RESPONSABLE.obras, plazo: '15 días', recurso: 'Cuadrilla de mantenimiento y solicitud a la concesionaria eléctrica', impacto: 'Menos puntos oscuros que facilitan robos y acoso' },
  ],
  espacio_abandonado: () => [
    { titulo: 'Limpieza y recuperación del espacio', responsable: RESPONSABLE.limpieza, plazo: '30 días', recurso: 'Cuadrilla de limpieza y cerco provisional', impacto: 'Quitar puntos de reunión para actividades ilícitas' },
  ],
  otro: () => [
    { titulo: 'Inspección en campo para identificar el problema', responsable: RESPONSABLE.serenazgo, plazo: 'Esta semana', recurso: '1 visita de serenazgo', impacto: 'Definir la acción adecuada con información del lugar' },
  ],
}

const PATRULLAJE = new Set(['robo', 'intento_robo'])
const NIVELES_PRIORIDAD = ['alta', 'media', 'baja']
const ETIQUETA_TENDENCIA ={ sube: 'en aumento', baja: 'en descenso', estable: 'estable' }

function porqueDe(z, accion) {
  const partes = []
  const tipo = accion.origen ?? z.tipoProbable
  if (tipo) partes.push(`${tipo.porcentaje}% de los reportes recientes son de ${tipo.label.toLowerCase()}`)
  if (z.franja && accion.titulo.includes('franja')) partes.push(`${z.franja.porcentaje}% ocurre de ${z.franja.label.split(' (')[0].toLowerCase()}`)
  if (z.tendencia.direccion !== 'estable' && z.tendencia.variacion !== null) partes.push(`tendencia ${ETIQUETA_TENDENCIA[z.tendencia.direccion]} (${z.tendencia.variacion > 0 ? '+' : ''}${z.tendencia.variacion}%)`)
  partes.push(`se esperan entre ${z.dias7.min} y ${z.dias7.max} reportes en 7 días`)
  return partes.join('; ')
}

function prioridadDe(z) {
  if (z.nivel === 'alta' || z.tendencia.direccion === 'sube') return 'alta'
  if (z.nivel === 'media') return 'media'
  return 'baja'
}

function accionesDe(z) {
  const plantilla = PLANTILLAS[z.tipoProbable?.id] ?? PLANTILLAS.otro
  const acciones = plantilla(z)
  // Si el segundo tipo también pesa (25 %+), se suma su acción principal.
  // Robo e intento de robo comparten la misma respuesta (patrullaje): no se duplica.
  const segundo = z.tipos[1]
  const mismoGrupo = [segundo?.id, z.tipoProbable?.id].every((t) => PATRULLAJE.has(t))
  if (segundo && segundo.porcentaje >= 25 && PLANTILLAS[segundo.id] && !mismoGrupo) acciones.push({ ...PLANTILLAS[segundo.id](z)[0], origen: segundo })
  if (z.confianza === 'baja') {
    acciones.unshift({ titulo: 'Validar en campo antes de asignar recursos', responsable: RESPONSABLE.serenazgo, plazo: 'Esta semana', recurso: '1 visita de verificación', impacto: 'Confirmar el patrón: la estimación tiene pocos datos' })
  }
  if (z.tendencia.direccion === 'sube') {
    acciones.push({ titulo: 'Seguimiento semanal de la zona en este panel', responsable: 'Gerencia de Seguridad Ciudadana', plazo: 'Cada semana', recurso: 'Revisión de 10 minutos', impacto: 'Detectar si las acciones frenan el aumento' })
  }
  // La primera acción hereda la prioridad de la zona; las siguientes bajan un escalón.
  const inicio = NIVELES_PRIORIDAD.indexOf(prioridadDe(z))
  return acciones.map(({ origen, ...a }, i) => ({
    id: `${z.id}-${i}`,
    ...a,
    prioridad: NIVELES_PRIORIDAD[Math.min(inicio + (i === 0 ? 0 : 1), NIVELES_PRIORIDAD.length - 1)],
    porque: porqueDe(z, { ...a, origen }),
  }))
}

function resumenReglas(z) {
  const partes = [`Se esperan entre ${z.dias7.min} y ${z.dias7.max} reportes en los próximos 7 días (confianza ${z.confianza}).`]
  if (z.tipoProbable) partes.push(`Predomina ${z.tipoProbable.label.toLowerCase()} (${z.tipoProbable.porcentaje}%)${z.franja ? `, sobre todo de ${z.franja.label.split(' (')[0].toLowerCase()}` : ''}.`)
  partes.push(`Tendencia ${ETIQUETA_TENDENCIA[z.tendencia.direccion]}${z.tendencia.variacion !== null && z.tendencia.direccion !== 'estable' ? ` (${z.tendencia.variacion > 0 ? '+' : ''}${z.tendencia.variacion}%)` : ''}.`)
  return partes.join(' ')
}

// --- IA generativa: solo redacta, nunca calcula ------------------------------------------------

const PROMPT = `Eres analista de seguridad ciudadana de la Municipalidad de Villa El Salvador (Lima, Perú).
Redacta, para cada zona, una justificación breve (máximo 45 palabras) de por qué conviene priorizarla,
dirigida a un funcionario municipal. Usa lenguaje claro, sin jerga y sin alarmismo.
Habla de "zona con mayor probabilidad de reportes", nunca de "zona peligrosa".

REGLAS ESTRICTAS:
- Usa ÚNICAMENTE las cifras que aparecen en los datos. No inventes números, fechas, porcentajes ni nombres.
- No menciones personas ni casos individuales.
- Recuerda que es una estimación con reportes ciudadanos, no un veredicto.
- Responde SOLO con JSON: {"zonas":[{"id":"...","justificacion":"..."}]}

DATOS:
{{datos}}`

const NUMERO = /\d+(?:[.,]\d+)?/g
const numerosDe = (texto) => new Set((String(texto).match(NUMERO) ?? []).map((n) => n.replace(',', '.')))

// Control anti-alucinación: toda cifra del texto debe existir en los datos de entrada.
export function soloCifrasConocidas(texto, permitidas) {
  for (const n of numerosDe(texto)) if (!permitidas.has(n)) return false
  return true
}

function datosParaIA(zonas) {
  return zonas.map((z) => ({
    id: z.id,
    zona: z.nombre,
    esperado7dias: { min: z.dias7.min, max: z.dias7.max },
    esperado30dias: { min: z.dias30.min, max: z.dias30.max },
    confianza: z.confianza,
    tendencia: z.tendencia,
    tipoMasProbable: z.tipoProbable ? { tipo: z.tipoProbable.label, porcentaje: z.tipoProbable.porcentaje } : null,
    franja: z.franja ? { franja: z.franja.label, porcentaje: z.franja.porcentaje } : null,
    reportesEn8Semanas: z.soporte.reportes,
  }))
}

async function redactarConIA(zonas) {
  if (!env.ia.groqApiKey || !zonas.length) return new Map()
  const datos = datosParaIA(zonas)
  const json = JSON.stringify(datos)
  const texto = await generarTextoGroq(PROMPT.replace('{{datos}}', json), { maxTokens: 700, temperature: 0.3 })
  if (!texto) return new Map()
  try {
    const inicio = texto.indexOf('{')
    const fin = texto.lastIndexOf('}')
    const salida = JSON.parse(texto.slice(inicio, fin + 1))
    const permitidas = numerosDe(json)
    const resultado = new Map()
    for (const z of salida.zonas ?? []) {
      const j = String(z.justificacion ?? '').trim()
      if (j && j.length <= 400 && soloCifrasConocidas(j, permitidas)) resultado.set(String(z.id), j)
      else if (j) console.warn(`IA: justificación descartada para la zona ${z.id} (cifras no presentes en los datos)`)
    }
    return resultado
  } catch {
    console.warn('IA: respuesta del plan no es JSON válido; se usa el plan por reglas')
    return new Map()
  }
}

// Caché corta: el plan se pide justo después de las predicciones.
let cache = { en: 0, datos: null }
async function prediccionesCacheadas() {
  if (Date.now() - cache.en > CACHE_MS || !cache.datos) cache = { en: Date.now(), datos: await obtenerPredicciones() }
  return cache.datos
}

export async function obtenerPlanAccion(query) {
  const pred = await prediccionesCacheadas()
  const pedidas = String(query.zonas ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const elegidas = (pedidas.length ? pred.zonas.filter((z) => pedidas.includes(z.id)) : pred.zonas.slice(0, 3)).slice(0, MAX_ZONAS)

  const redaccion = await redactarConIA(elegidas)
  const zonas = elegidas.map((z) => ({
    id: z.id,
    nombre: z.nombre,
    centro: z.centro,
    nivel: z.nivel,
    confianza: z.confianza,
    tendencia: z.tendencia,
    prioridad: prioridadDe(z),
    justificacion: redaccion.get(z.id) ?? resumenReglas(z),
    redactadoPor: redaccion.has(z.id) ? 'ia' : 'reglas',
    acciones: accionesDe(z),
  }))

  return {
    generadoEn: new Date().toISOString(),
    iaDisponible: Boolean(env.ia.groqApiKey),
    incluyeDemo: pred.incluyeDemo,
    zonas,
  }
}
