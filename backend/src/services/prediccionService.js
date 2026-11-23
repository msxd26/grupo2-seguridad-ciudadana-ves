import { ReporteModel } from '../models/ReporteModel.js'
import { ComisariaModel } from '../models/ComisariaModel.js'
import { DenunciaModel } from '../models/DenunciaModel.js'
import { UBIGEO_VES, etiquetaTipo } from '../config/fuente.js'
import { celdaDe } from '../utils/geo.js'
import { referenciaCercana } from './ciudadanoService.js'

// Predicción de reportes por zona: método estadístico transparente, explicable en 20 segundos.
//
//   esperado(7 días) = tasa semanal reciente × tendencia × ajuste estacional
//
// - Tasa semanal reciente: media ponderada de las últimas 4 semanas (pesos 4·3·2·1).
// - Tendencia: últimos 14 días frente a los 14 anteriores; el multiplicador se acota a [0,7 – 1,3].
// - Ajuste estacional: índice mensual de las denuncias oficiales SIDPOL del distrito
//   (mes proyectado ÷ mes actual), acotado a [0,85 – 1,15]. SIDPOL no tiene coordenadas: es un ajuste distrital.
// - Rango: intervalo de Poisson al 80 % (λ ± 1,28·√λ).
// Solo se trabaja con datos AGREGADOS por zona (~330 m). Nunca se exponen reportes individuales (ODS 5).

const SEMANAS = 8
const DIA_MS = 86_400_000
const SEMANA_MS = 7 * DIA_MS
const PESOS_TASA = [4, 3, 2, 1] // semana 0 = últimos 7 días
export const UMBRAL_MINIMO = 5 // reportes en 8 semanas para mostrar una predicción
const UMBRAL_TIPO = 3 // un tipo (en especial acoso) solo se desglosa con 3+ reportes en la zona
const Z80 = 1.2816
const SEMANAS_PROYECCION = 4

const ZONA_HORARIA = 'America/Lima'
const horaLima = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA_HORARIA, hour: '2-digit', hourCycle: 'h23' })
const diaSemanaLima = new Intl.DateTimeFormat('en-US', { timeZone: ZONA_HORARIA, weekday: 'short' })
const mesLima = new Intl.DateTimeFormat('en-US', { timeZone: ZONA_HORARIA, month: 'numeric' })
const fechaLima = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }) // AAAA-MM-DD

const FRANJAS = [
  { id: 'madrugada', label: 'Madrugada (0–6 h)', desde: 0 },
  { id: 'manana', label: 'Mañana (6–12 h)', desde: 6 },
  { id: 'tarde', label: 'Tarde (12–18 h)', desde: 12 },
  { id: 'noche', label: 'Noche (18–24 h)', desde: 18 },
]
const DIAS = { Mon: 'lunes', Tue: 'martes', Wed: 'miércoles', Thu: 'jueves', Fri: 'viernes', Sat: 'sábado', Sun: 'domingo' }
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const acotar = (v, min, max) => Math.min(max, Math.max(min, v))
const redondear1 = (v) => Math.round(v * 10) / 10

// Intervalo de Poisson al 80 %: honesto con pocos datos y fácil de explicar.
function rango(lambda) {
  return { esperado: redondear1(lambda), min: Math.max(0, Math.floor(lambda - Z80 * Math.sqrt(lambda))), max: Math.ceil(lambda + Z80 * Math.sqrt(lambda)) }
}

function franjaDe(fecha) {
  const h = Number(horaLima.format(fecha))
  return FRANJAS[Math.floor(h / 6)].id
}

// Conteos por semana (0 = últimos 7 días … 7 = hace 7–8 semanas).
function porSemana(reportes, ahora) {
  const semanas = Array(SEMANAS).fill(0)
  for (const r of reportes) {
    const s = Math.floor((ahora - r.fecha.getTime()) / SEMANA_MS)
    if (s >= 0 && s < SEMANAS) semanas[s]++
  }
  return semanas
}

const tasaSemanal = (semanas) => PESOS_TASA.reduce((a, p, i) => a + p * semanas[i], 0) / PESOS_TASA.reduce((a, b) => a + b, 0)

// Últimos 14 días frente a los 14 anteriores.
function tendenciaDe(semanas) {
  const reciente = semanas[0] + semanas[1]
  const previo = semanas[2] + semanas[3]
  const variacion = previo ? Math.round(((reciente - previo) / previo) * 100) : null
  let direccion = 'estable'
  if (previo === 0 && reciente >= 3) direccion = 'sube'
  else if (variacion !== null && variacion >= 25 && reciente - previo >= 3) direccion = 'sube'
  else if (variacion !== null && variacion <= -25 && previo - reciente >= 3) direccion = 'baja'
  const factor = direccion === 'estable' || !previo ? (direccion === 'sube' ? 1.3 : 1) : acotar(reciente / previo, 0.7, 1.3)
  return { direccion, variacion, reciente, previo, factor }
}

// Índice estacional del distrito con SIDPOL (años completos). Devuelve una función mes → índice.
async function cargarEstacionalidad() {
  const anioActual = new Date().getFullYear()
  const filas = await DenunciaModel.totalesPorMes({ ubigeo: UBIGEO_VES, desde: 2018, hasta: anioActual - 1 })
  if (filas.length < 12) return { indice: () => 1, disponible: false }
  const promedios = new Map(filas.map((f) => [f.mes, f.total / f.anios]))
  const media = [...promedios.values()].reduce((a, b) => a + b, 0) / promedios.size
  return { indice: (mes) => (promedios.get(mes) ?? media) / media, disponible: true, desde: 2018, hasta: anioActual - 1 }
}

const mesEn = (ms) => Number(mesLima.format(new Date(ms)))

function ajusteEstacional(est, ahora, diasAdelante) {
  const mesActual = mesEn(ahora - 14 * DIA_MS) // la tasa reciente ya refleja este mes
  const mesObjetivo = mesEn(ahora + (diasAdelante / 2) * DIA_MS)
  const factor = est.disponible ? acotar(est.indice(mesObjetivo) / est.indice(mesActual), 0.85, 1.15) : 1
  return { mesActual, mesObjetivo, factor: Math.round(factor * 100) / 100 }
}

function confianzaDe(total, semanasConDatos) {
  if (total >= 20 && semanasConDatos >= 4) return 'alta'
  if (total >= 8 && semanasConDatos >= 3) return 'media'
  return 'baja'
}

// Probabilidad de reportes (no "peligrosidad": no se estigmatiza al barrio).
const nivelDe = (esperado7) => (esperado7 >= 4 ? 'alta' : esperado7 >= 2 ? 'media' : 'baja')

// Tipos con 3+ reportes; el resto se agrupa en "otros" (protege a quien reporta acoso).
function tiposDe(reportes, ahora) {
  const pesos = new Map()
  const conteo = new Map()
  for (const r of reportes) {
    const s = Math.floor((ahora - r.fecha.getTime()) / SEMANA_MS)
    pesos.set(r.tipo, (pesos.get(r.tipo) ?? 0) + (SEMANAS - s)) // lo reciente pesa más
    conteo.set(r.tipo, (conteo.get(r.tipo) ?? 0) + 1)
  }
  const totalPeso = [...pesos.values()].reduce((a, b) => a + b, 0)
  const visibles = [...pesos.entries()]
    .filter(([tipo]) => conteo.get(tipo) >= UMBRAL_TIPO)
    .map(([tipo, p]) => ({ id: tipo, label: etiquetaTipo(tipo), porcentaje: Math.round((p / totalPeso) * 100), reportes: conteo.get(tipo) }))
    .sort((a, b) => b.porcentaje - a.porcentaje)
  return visibles
}

function franjaPico(reportes) {
  const cuenta = new Map(FRANJAS.map((f) => [f.id, 0]))
  for (const r of reportes) cuenta.set(franjaDe(r.fecha), cuenta.get(franjaDe(r.fecha)) + 1)
  const [id, n] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]
  const porcentaje = Math.round((n / reportes.length) * 100)
  return porcentaje >= 40 ? { id, label: FRANJAS.find((f) => f.id === id).label, porcentaje } : null
}

function diaPico(reportes) {
  const cuenta = new Map()
  for (const r of reportes) {
    const d = diaSemanaLima.format(r.fecha)
    cuenta.set(d, (cuenta.get(d) ?? 0) + 1)
  }
  const [d, n] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]
  const porcentaje = Math.round((n / reportes.length) * 100)
  return porcentaje >= 25 ? { id: d, label: DIAS[d], porcentaje } : null // 1/7 ≈ 14 %: 25 % ya es un patrón
}

function textoEstacional(aj) {
  if (aj.factor === 1 || aj.mesActual === aj.mesObjetivo) return null
  const pct = Math.round((aj.factor - 1) * 100)
  return `Ajuste estacional SIDPOL: ${MESES[aj.mesObjetivo - 1]} frente a ${MESES[aj.mesActual - 1]} (${pct > 0 ? '+' : ''}${pct}%)`
}

function predecirZona(id, reportes, ctx) {
  const { ahora, est, comisarias } = ctx
  const celda = celdaDe(reportes[0].lat, reportes[0].lng)
  const centro = { lat: redondear1Coord((celda.sur + celda.norte) / 2), lng: redondear1Coord((celda.oeste + celda.este) / 2) }
  const nombre = referenciaCercana(centro.lat, centro.lng, comisarias) || 'Zona sin referencia'
  const semanas = porSemana(reportes, ahora)
  const total = reportes.length
  const semanasConDatos = semanas.filter((n) => n > 0).length
  const base = { id, nombre, centro, limites: { sur: celda.sur, oeste: celda.oeste, norte: celda.norte, este: celda.este }, soporte: { reportes: total, semanasConDatos } }

  // Sin datos suficientes no se inventa un número.
  if (total < UMBRAL_MINIMO) return { ...base, estado: 'insuficiente' }

  const tasa = tasaSemanal(semanas)
  const tendencia = tendenciaDe(semanas)
  const aj7 = ajusteEstacional(est, ahora, 7)
  const aj30 = ajusteEstacional(est, ahora, 30)
  const dias7 = rango(tasa * tendencia.factor * aj7.factor)
  const dias30 = rango(tasa * (30 / 7) * tendencia.factor * aj30.factor)
  const tipos = tiposDe(reportes, ahora)
  const franja = franjaPico(reportes)
  const dia = diaPico(reportes)

  const factores = [
    `${total} reportes en las últimas ${SEMANAS} semanas (${semanas[0] + semanas[1] + semanas[2] + semanas[3]} en las últimas 4)`,
    tendencia.variacion !== null
      ? `${tendencia.variacion > 0 ? '+' : ''}${tendencia.variacion}% en los últimos 14 días frente a los 14 anteriores (${tendencia.reciente} frente a ${tendencia.previo})`
      : `${tendencia.reciente} reportes en los últimos 14 días y ninguno en los 14 anteriores`,
    tipos[0] ? `${tipos[0].porcentaje}% de los reportes recientes son de ${tipos[0].label.toLowerCase()}` : null,
    franja ? `${franja.porcentaje}% ocurre de ${franja.label.split(' (')[0].toLowerCase()}` : null,
    dia ? `${dia.porcentaje}% ocurre un ${dia.label}` : null,
    textoEstacional(aj30),
  ].filter(Boolean)

  return {
    ...base,
    estado: 'ok',
    confianza: confianzaDe(total, semanasConDatos),
    nivel: nivelDe(dias7.esperado),
    dias7,
    dias30,
    semanas: [...semanas].reverse(), // de la más antigua a la más reciente
    tendencia: { direccion: tendencia.direccion, variacion: tendencia.variacion },
    tipoProbable: tipos[0] ?? null,
    tipos: tipos.slice(0, 3),
    franja,
    dia,
    factores,
  }
}

const redondear1Coord = (v) => Math.round(v * 1e6) / 1e6

// Serie semanal del distrito (histórico + proyección con banda de incertidumbre).
function proyeccionDistrito(reportes, ahora, est) {
  const semanas = porSemana(reportes, ahora)
  const inicioSemana = (s) => fechaLima.format(new Date(ahora - (s + 1) * SEMANA_MS + DIA_MS))
  const historico = semanas.map((total, s) => ({ semana: inicioSemana(s), total })).reverse()
  const tasa = tasaSemanal(semanas)
  const tendencia = tendenciaDe(semanas)
  const proyeccion = Array.from({ length: SEMANAS_PROYECCION }, (_, i) => {
    const aj = ajusteEstacional(est, ahora, 7 * i + 7)
    return { semana: fechaLima.format(new Date(ahora + i * SEMANA_MS + DIA_MS)), ...rango(tasa * tendencia.factor * aj.factor) }
  })
  return { historico, proyeccion, tendencia: { direccion: tendencia.direccion, variacion: tendencia.variacion }, tasaSemanal: redondear1(tasa) }
}

export async function obtenerPredicciones() {
  const ahora = Date.now()
  const [reportes, comisarias, est] = await Promise.all([
    ReporteModel.listarParaPrediccion({ dias: SEMANAS * 7 }),
    ComisariaModel.listar(),
    cargarEstacionalidad(),
  ])

  const porZona = new Map()
  for (const r of reportes) {
    const { id } = celdaDe(r.lat, r.lng)
    if (!porZona.has(id)) porZona.set(id, [])
    porZona.get(id).push(r)
  }

  const ctx = { ahora, est, comisarias }
  const zonas = [...porZona.entries()].map(([id, lista]) => predecirZona(id, lista, ctx))
  const ok = zonas.filter((z) => z.estado === 'ok').sort((a, b) => b.dias7.esperado - a.dias7.esperado || b.soporte.reportes - a.soporte.reportes)
  const insuficientes = zonas.filter((z) => z.estado === 'insuficiente')
  const demo = reportes.filter((r) => r.esDemo).length
  const aj = ajusteEstacional(est, ahora, 30)

  return {
    generadoEn: new Date(ahora).toISOString(),
    ventana: { semanas: SEMANAS, desde: fechaLima.format(new Date(ahora - SEMANAS * SEMANA_MS)), hasta: fechaLima.format(new Date(ahora)) },
    metodo: 'Tasa semanal reciente (últimas 4 semanas, ponderada) × tendencia (14 vs 14 días, acotada) × ajuste estacional SIDPOL; rango de Poisson al 80 %.',
    umbralMinimo: UMBRAL_MINIMO,
    totalReportes: reportes.length,
    incluyeDemo: demo > 0,
    porcentajeDemo: reportes.length ? Math.round((demo / reportes.length) * 100) : 0,
    estacionalidad: est.disponible
      ? { disponible: true, fuente: `SIDPOL ${est.desde}–${est.hasta}`, mesObjetivo: MESES[aj.mesObjetivo - 1], factor: aj.factor }
      : { disponible: false },
    distrito: proyeccionDistrito(reportes, ahora, est),
    zonas: ok,
    // De las zonas con pocos datos solo se informa cuántas son: nada que permita ubicar reportes aislados.
    zonasInsuficientes: insuficientes.length,
  }
}
