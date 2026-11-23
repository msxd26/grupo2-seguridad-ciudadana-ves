import { ComisariaModel } from '../models/ComisariaModel.js'
import { ReporteModel } from '../models/ReporteModel.js'
import { FUENTE_COMISARIAS, FUENTE_LIMITE } from '../config/fuente.js'
import { LIMITE_VES, celdaDe } from '../utils/geo.js'
import { parsearDias, parsearTipos } from './reportesService.js'

export const NIVELES_ZONA = { alto: 5, medio: 3 }

const nivelZona = (cantidad) =>
  cantidad >= NIVELES_ZONA.alto ? 'alto' : cantidad >= NIVELES_ZONA.medio ? 'medio' : 'bajo'

// Agrupa reportes en celdas de la cuadrícula: así se identifican zonas de riesgo.
export function calcularZonas(reportes) {
  const celdas = new Map()
  for (const r of reportes) {
    const celda = celdaDe(r.lat, r.lng)
    const actual = celdas.get(celda.id) ?? { ...celda, cantidad: 0, tipos: {}, soloDemo: true }
    actual.cantidad++
    actual.tipos[r.tipo] = (actual.tipos[r.tipo] ?? 0) + 1
    actual.soloDemo &&= r.esDemo
    celdas.set(celda.id, actual)
  }
  return [...celdas.values()]
    .map((c) => ({
      ...c,
      nivel: nivelZona(c.cantidad),
      tipoPrincipal: Object.entries(c.tipos).sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

export async function obtenerMapa(query) {
  const dias = parsearDias(query.dias)
  const tipos = parsearTipos(query.tipos)
  const [comisarias, reportes] = await Promise.all([
    ComisariaModel.listar(),
    ReporteModel.listarRecientes({ dias, tipos }),
  ])
  return {
    dias,
    limite: LIMITE_VES.geojson,
    bbox: LIMITE_VES.bbox,
    comisarias,
    reportes,
    zonas: calcularZonas(reportes),
    fuentes: { comisarias: FUENTE_COMISARIAS, limite: FUENTE_LIMITE },
  }
}

export const listarComisarias = () => ComisariaModel.listar()
