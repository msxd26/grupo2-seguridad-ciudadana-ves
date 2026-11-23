import { ReporteModel } from '../models/ReporteModel.js'
import { bus, emitir } from './eventos.js'

// Puente de eventos por la base de datos.
// El bus de eventos vive en la memoria de cada backend: si hay más de uno usando la misma BD
// (p. ej. el backend de desarrollo y el de Docker, o varias réplicas), los navegadores de uno no
// se enteraban de los reportes creados en el otro. Cada INTERVALO_MS se revisa la BD y se reenvían
// a los navegadores propios los reportes y moderaciones que guardó OTRO backend.

const INTERVALO_MS = Number(process.env.SINCRONIZACION_MS ?? 2000)
const RECORDAR_MS = 5 * 60_000 // cuánto se recuerda lo emitido localmente (para no duplicar)
const ESPERA_RECIENTE_MS = 2500 // creado_en tiene precisión de segundos: margen holgado

const emitidos = new Map() // id de reporte → momento en que este backend lo emitió
const moderados = new Map() // `${id}:${estado}` → momento en que este backend lo emitió
let ultimoId = 0
let ultimaRevision = new Date()
let temporizador = null

function olvidarViejos(mapa) {
  const limite = Date.now() - RECORDAR_MS
  for (const [k, t] of mapa) if (t < limite) mapa.delete(k)
}

async function revisar() {
  try {
    const nuevos = await ReporteModel.listarDesdeId(ultimoId)
    for (const r of nuevos) {
      // Recién guardado y aún no emitido aquí: puede que ESTE backend esté por emitirlo
      // (entre el INSERT y el aviso hay una consulta). Se revisa en la próxima vuelta.
      if (!emitidos.has(r.id) && Date.now() - new Date(r.creadoEn).getTime() < ESPERA_RECIENTE_MS) break
      ultimoId = Math.max(ultimoId, r.id)
      if (!emitidos.has(r.id)) emitir('reporte', r) // lo creó otro backend
    }

    const desde = ultimaRevision
    ultimaRevision = new Date(Date.now() - 1000) // margen de 1 s: revisado_en tiene precisión de segundos
    for (const m of await ReporteModel.moderadosDesde(desde)) {
      if (!moderados.has(`${m.id}:${m.estado}`)) emitir('reporte-moderado', { id: m.id, estado: m.estado, oculto: m.oculto })
    }

    olvidarViejos(emitidos)
    olvidarViejos(moderados)
  } catch (err) {
    console.warn(`Sincronización de eventos: ${err.message}`)
  } finally {
    temporizador = setTimeout(revisar, INTERVALO_MS)
  }
}

export async function iniciarSincronizacion() {
  if (INTERVALO_MS <= 0) return // SINCRONIZACION_MS=0 la desactiva (un solo backend)
  // Todo lo que emite este backend (incluido lo reenviado) queda registrado para no repetirlo.
  bus.on('evento', ({ tipo, datos }) => {
    if (tipo === 'reporte') emitidos.set(datos.id, Date.now())
    if (tipo === 'reporte-moderado') moderados.set(`${datos.id}:${datos.estado}`, Date.now())
  })
  try {
    ultimoId = await ReporteModel.ultimoId() // solo lo que llegue desde ahora
  } catch (err) {
    console.warn(`Sincronización de eventos: sin BD al iniciar (${err.message})`)
  }
  temporizador = setTimeout(revisar, INTERVALO_MS)
}

export function detenerSincronizacion() {
  clearTimeout(temporizador)
}
