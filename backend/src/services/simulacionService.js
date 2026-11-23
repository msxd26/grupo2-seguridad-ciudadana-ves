import { ReporteModel } from '../models/ReporteModel.js'
import { crearAzar, generarReporteDemo } from '../utils/demo.js'
import { emitir } from '../utils/eventos.js'

// Simulación en vivo para presentaciones: crea reportes DEMO cada pocos segundos
// para que el público vea aparecer incidentes en el mapa en tiempo real.
const DURACION_MAX_MS = 30 * 60_000 // se apaga sola a los 30 minutos
const azar = crearAzar()

let estado = { activa: false, intervaloSeg: 10, generados: 0, iniciadaEn: null, terminaEn: null }
let temporizador = null
let apagado = null

function programar() {
  // Intervalo con variación (±40%) para que se sienta natural.
  const ms = estado.intervaloSeg * 1000 * (0.6 + azar() * 0.8)
  temporizador = setTimeout(async () => {
    try {
      const reporte = await ReporteModel.crearDemo(generarReporteDemo(azar, new Date(Date.now() - azar() * 10 * 60_000)))
      estado.generados++
      emitir('reporte', reporte)
    } catch (err) {
      console.error('Simulación:', err.message)
    }
    if (estado.activa) programar()
  }, ms)
}

export function estadoSimulacion() {
  return { ...estado }
}

export function iniciarSimulacion({ intervaloSeg } = {}) {
  detenerSimulacion()
  const seg = Math.min(60, Math.max(3, Number(intervaloSeg) || 10))
  const ahora = Date.now()
  estado = { activa: true, intervaloSeg: seg, generados: 0, iniciadaEn: new Date(ahora), terminaEn: new Date(ahora + DURACION_MAX_MS) }
  programar()
  apagado = setTimeout(detenerSimulacion, DURACION_MAX_MS)
  emitir('simulacion', estadoSimulacion())
  return estadoSimulacion()
}

export function detenerSimulacion() {
  clearTimeout(temporizador)
  clearTimeout(apagado)
  const estabaActiva = estado.activa
  estado = { ...estado, activa: false, terminaEn: null }
  if (estabaActiva) emitir('simulacion', estadoSimulacion())
  return estadoSimulacion()
}

// Ráfaga de alertas: crea varios reportes DEMO seguidos (uno cada ~1.5 s) para probar
// los avisos de la web y la app. Responde de inmediato; los reportes llegan por WebSocket.
const INTERVALO_RAFAGA_MS = 1500
let rafagaEnCurso = false

export function generarRafaga({ cantidad } = {}) {
  const n = Math.min(10, Math.max(1, Number.parseInt(cantidad, 10) || 5))
  if (rafagaEnCurso) {
    throw Object.assign(new Error('Ya hay una ráfaga en curso. Espera a que termine.'), { status: 409 })
  }
  rafagaEnCurso = true
  emitir('rafaga', { cantidad: n, estado: 'iniciada' })

  let intentos = 0 // se cuentan intentos (no éxitos) para que un error de BD no la deje en bucle
  const siguiente = async () => {
    intentos++
    try {
      // Hora del hecho: "ahora mismo", para que todos los avisos digan "hace un momento".
      const reporte = await ReporteModel.crearDemo(generarReporteDemo(azar, new Date()))
      emitir('reporte', reporte)
    } catch (err) {
      console.error('Ráfaga:', err.message)
    }
    if (intentos < n) setTimeout(siguiente, INTERVALO_RAFAGA_MS)
    else {
      rafagaEnCurso = false
      emitir('rafaga', { cantidad: n, estado: 'terminada' })
    }
  }
  siguiente()
  return { cantidad: n, intervaloMs: INTERVALO_RAFAGA_MS }
}
