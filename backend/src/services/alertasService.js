import { DenunciaModel } from '../models/DenunciaModel.js'
import { ReporteModel } from '../models/ReporteModel.js'
import { FUENTE_DENUNCIAS, UBIGEO_VES, nombreModalidad } from '../config/fuente.js'
import { MESES, formatNumero, signo, variacionPorcentual } from '../utils/texto.js'
import { obtenerMeta } from './metaService.js'
import { NIVELES_ZONA, calcularZonas } from './mapaService.js'

const ORDEN_NIVEL = { alta: 0, media: 1, informativa: 2 }

// Zonas con varios reportes ciudadanos en los últimos 7 días.
async function alertasDeZonas() {
  const reportes = await ReporteModel.listarRecientes({ dias: 7 })
  return calcularZonas(reportes)
    .filter((z) => z.cantidad >= NIVELES_ZONA.medio)
    .map((z) => ({
      id: `zona-${z.id}`,
      tipo: 'zona',
      nivel: z.nivel === 'alto' ? 'alta' : 'media',
      titulo: `Zona con ${z.cantidad} reportes en 7 días`,
      mensaje: `Concentración de reportes ciudadanos (principalmente ${z.tipoPrincipal.toLowerCase()}). Se recomienda precaución y patrullaje en la zona.`,
      lat: (z.sur + z.norte) / 2,
      lng: (z.oeste + z.este) / 2,
      esDemo: z.soloDemo,
      fuente: 'Reportes ciudadanos de Alerta VES',
    }))
}

// Modalidades oficiales que crecen: últimos 3 meses publicados vs. los mismos meses del año anterior.
async function alertasDeTendencia(meta) {
  const filas = await DenunciaModel.detalleDistrito({
    ubigeo: UBIGEO_VES, desde: meta.ultimoAnio - 1, hasta: meta.ultimoAnio, modalidades: [],
  })
  const ultimoMes = meta.periodoPorAnio.get(meta.ultimoAnio).ultimoMes
  const ventana = [] // [anio, mes] de los 3 últimos meses publicados
  for (let i = 0; i < 3; i++) {
    const m = ultimoMes - i
    ventana.push(m >= 1 ? [meta.ultimoAnio, m] : [meta.ultimoAnio - 1, m + 12])
  }
  const actual = new Map()
  const previo = new Map()
  for (const r of filas) {
    if (ventana.some(([a, m]) => r.anio === a && r.mes === m)) actual.set(r.modalidad, (actual.get(r.modalidad) ?? 0) + r.total)
    if (ventana.some(([a, m]) => r.anio === a - 1 && r.mes === m)) previo.set(r.modalidad, (previo.get(r.modalidad) ?? 0) + r.total)
  }
  const [, mesInicio] = ventana.at(-1)
  const periodo = `${MESES[mesInicio - 1]}–${MESES[ultimoMes - 1]} ${meta.ultimoAnio}`

  return [...actual.entries()]
    .filter(([modalidad]) => modalidad !== 'Otros')
    .map(([modalidad, total]) => ({ modalidad, total, previo: previo.get(modalidad) ?? 0 }))
    .map((m) => ({ ...m, variacion: variacionPorcentual(m.total, m.previo) }))
    .filter((m) => m.variacion !== null && m.variacion >= 10 && m.total >= 30)
    .map((m) => ({
      id: `tendencia-${m.modalidad}`,
      tipo: 'tendencia',
      nivel: m.variacion >= 25 ? 'alta' : 'media',
      titulo: `${nombreModalidad(m.modalidad)}: ${signo(m.variacion)}%`,
      mensaje: `Entre ${periodo} se registraron ${formatNumero(m.total)} denuncias de ${nombreModalidad(m.modalidad).toLowerCase()} en Villa El Salvador, frente a ${formatNumero(m.previo)} en los mismos meses del año anterior.`,
      fuente: `${FUENTE_DENUNCIAS.entidad} – SIDPOL`,
    }))
}

// Mes siguiente históricamente por encima del promedio.
async function alertaEstacional(meta) {
  const filas = await DenunciaModel.detalleDistrito({
    ubigeo: UBIGEO_VES, desde: meta.primerAnio, hasta: meta.ultimoAnio, modalidades: [],
  })
  const porMes = Array.from({ length: 12 }, () => ({ suma: 0, anios: new Set() }))
  for (const r of filas) {
    porMes[r.mes - 1].suma += r.total
    porMes[r.mes - 1].anios.add(r.anio)
  }
  const promedios = porMes.map((m) => (m.anios.size ? m.suma / m.anios.size : 0))
  const media = promedios.reduce((a, b) => a + b, 0) / 12
  const siguiente = (new Date().getMonth() + 1) % 12 // índice del próximo mes
  const exceso = Math.round(((promedios[siguiente] - media) / media) * 100)
  if (exceso < 3) return []
  return [{
    id: `estacional-${siguiente + 1}`,
    tipo: 'estacional',
    nivel: 'informativa',
    titulo: `${MESES[siguiente].replace(/^./, (c) => c.toUpperCase())} suele tener más denuncias`,
    mensaje: `Desde ${meta.primerAnio}, ${MESES[siguiente]} registra en promedio ${exceso}% más denuncias que un mes típico en Villa El Salvador. Conviene planificar refuerzos preventivos.`,
    fuente: `${FUENTE_DENUNCIAS.entidad} – SIDPOL`,
  }]
}

export async function obtenerAlertas() {
  const meta = await obtenerMeta()
  const grupos = await Promise.all([alertasDeZonas(), alertasDeTendencia(meta), alertaEstacional(meta)])
  return grupos.flat().sort((a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel])
}
