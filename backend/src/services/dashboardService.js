import { DenunciaModel } from '../models/DenunciaModel.js'
import { FUENTE_DENUNCIAS, UBIGEO_VES, nombreModalidad } from '../config/fuente.js'
import { ErrorValidacion, MESES, formatNumero, signo, variacionPorcentual } from '../utils/texto.js'
import { obtenerMeta } from './metaService.js'

const TOP_RANKING = 15

// --- Filtros -------------------------------------------------------------------------------

export function parsearFiltros(query, meta) {
  const ubigeo = query.distrito ?? UBIGEO_VES
  const distrito = meta.distritos.find((d) => d.ubigeo === ubigeo)
  if (!distrito) throw new ErrorValidacion('Distrito no válido')

  const hasta = query.hasta ? Number(query.hasta) : meta.ultimoAnio
  const desde = query.desde ? Number(query.desde) : Math.max(meta.primerAnio, hasta - 2)
  if (!meta.periodoPorAnio.has(desde) || !meta.periodoPorAnio.has(hasta) || desde > hasta) {
    throw new ErrorValidacion(`Rango de años no válido (disponible: ${meta.primerAnio}–${meta.ultimoAnio})`)
  }

  const validas = new Set(meta.modalidades.map((m) => m.id))
  const modalidades = (query.modalidades ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => validas.has(m))

  return { ubigeo, distrito, desde, hasta, modalidades }
}

// --- Cálculos ------------------------------------------------------------------------------

const sumar = (filas) => filas.reduce((acc, r) => acc + r.total, 0)

function prioridadDe({ modalidad, participacion, variacion, total }) {
  if (modalidad === 'Otros') return null
  if ((participacion >= 15 && variacion > 0) || (variacion >= 20 && total >= 100)) return 'alta'
  if (variacion > 0 || participacion >= 15) return 'media'
  return 'baja'
}

function etiquetaPeriodo(desde, hasta, ultimoMes) {
  const rango = desde === hasta ? `${desde}` : `${desde}–${hasta}`
  return ultimoMes === 12 ? rango : `${rango} (hasta ${MESES[ultimoMes - 1]} ${hasta})`
}

function generarHallazgos({ filtros, kpis, porAnio, porModalidad, estacionalidad, ranking, periodo }) {
  const h = []
  const nombre = filtros.distrito.nombre

  if (kpis.variacion !== null) {
    h.push({
      tipo: kpis.variacion > 0 ? 'alerta' : 'positivo',
      texto: `En ${periodo} se registraron ${formatNumero(kpis.total)} denuncias en ${nombre}: ${signo(kpis.variacion)}% frente al periodo anterior equivalente (${formatNumero(kpis.totalPrevio)}).`,
    })
  } else {
    h.push({ tipo: 'info', texto: `En ${periodo} se registraron ${formatNumero(kpis.total)} denuncias en ${nombre}.` })
  }

  const especificas = porModalidad.filter((m) => m.id !== 'Otros' && m.variacion !== null && m.totalPrevio >= 30)
  const crece = especificas.filter((m) => m.variacion > 0).sort((a, b) => b.variacion - a.variacion)[0]
  const baja = especificas.filter((m) => m.variacion < 0).sort((a, b) => a.variacion - b.variacion)[0]
  if (crece) {
    h.push({
      tipo: 'alerta',
      texto: `${crece.modalidad} es la modalidad que más crece (${signo(crece.variacion)}%, ${formatNumero(crece.total)} denuncias). Conviene priorizarla en las estrategias de prevención.`,
    })
  }
  if (baja) {
    h.push({
      tipo: 'positivo',
      texto: `${baja.modalidad} disminuyó ${Math.abs(baja.variacion)}% (${formatNumero(baja.totalPrevio)} → ${formatNumero(baja.total)}).`,
    })
  }

  // Tendencia de largo plazo: primer vs. último año completo del rango.
  const completos = porAnio.filter((a) => a.completo)
  if (completos.length >= 3) {
    const primero = completos[0]
    const ultimo = completos.at(-1)
    const v = variacionPorcentual(ultimo.total, primero.total)
    if (v !== null && Math.abs(v) >= 10) {
      h.push({
        tipo: v > 0 ? 'alerta' : 'positivo',
        texto: `Tendencia de largo plazo: entre ${primero.anio} y ${ultimo.anio} las denuncias pasaron de ${formatNumero(primero.total)} a ${formatNumero(ultimo.total)} al año (${signo(v)}%).`,
      })
    }
  }

  const principal = porModalidad.length > 1 ? porModalidad.find((m) => m.id !== 'Otros') : null
  if (principal) {
    h.push({
      tipo: 'info',
      texto: `${principal.modalidad} concentra el ${principal.participacion}% de las denuncias del periodo: es la modalidad específica más frecuente.`,
    })
  }

  const conDatos = estacionalidad.filter((e) => e.promedio > 0)
  if (conDatos.length >= 6) {
    const pico = conDatos.reduce((a, b) => (b.promedio > a.promedio ? b : a))
    const media = conDatos.reduce((acc, e) => acc + e.promedio, 0) / conDatos.length
    h.push({
      tipo: 'info',
      texto: `Estacionalidad: ${MESES[pico.mes - 1]} es en promedio el mes con más denuncias (${Math.round(((pico.promedio - media) / media) * 100)}% sobre el promedio mensual). Planificar refuerzos con anticipación.`,
    })
  }

  if (ranking.posicion) {
    h.push({
      tipo: ranking.posicion <= 10 ? 'alerta' : 'info',
      texto: `${nombre} ocupa el puesto ${ranking.posicion} de ${ranking.de} distritos de Lima Metropolitana y aporta el ${ranking.participacion}% de las denuncias del periodo.`,
    })
  }
  return h
}

// --- Dashboard -----------------------------------------------------------------------------

export async function obtenerDashboard(query) {
  const meta = await obtenerMeta()
  const filtros = parsearFiltros(query, meta)
  const { ubigeo, desde, hasta, modalidades } = filtros

  const n = hasta - desde + 1
  const ultimoMes = meta.periodoPorAnio.get(hasta).ultimoMes
  const desdePrev = desde - n
  const hastaPrev = hasta - n
  const hayPrevio = desdePrev >= meta.primerAnio

  const [detalle, rankingDistritos] = await Promise.all([
    DenunciaModel.detalleDistrito({ ubigeo, desde: hayPrevio ? desdePrev : desde, hasta, modalidades }),
    DenunciaModel.rankingDistritos({ desde, hasta, ultimoMes, modalidades }),
  ])

  const enPeriodo = (r, d, h) => r.anio >= d && r.anio <= h && (r.anio < h || r.mes <= ultimoMes)
  const actual = detalle.filter((r) => enPeriodo(r, desde, hasta))
  const previo = hayPrevio ? detalle.filter((r) => enPeriodo(r, desdePrev, hastaPrev)) : []

  // Serie mensual completa (con ceros) y promedio móvil de 3 meses.
  const porMesMap = new Map()
  for (const r of actual) porMesMap.set(`${r.anio}-${r.mes}`, (porMesMap.get(`${r.anio}-${r.mes}`) ?? 0) + r.total)
  const serieMensual = []
  for (let anio = desde; anio <= hasta; anio++) {
    const ultimo = anio === hasta ? ultimoMes : meta.periodoPorAnio.get(anio).ultimoMes
    for (let mes = 1; mes <= ultimo; mes++) serieMensual.push({ anio, mes, total: porMesMap.get(`${anio}-${mes}`) ?? 0 })
  }
  serieMensual.forEach((p, i) => {
    p.promedioMovil = i >= 2 ? Math.round((serieMensual[i - 2].total + serieMensual[i - 1].total + p.total) / 3) : null
  })

  const porAnio = []
  for (let anio = desde; anio <= hasta; anio++) {
    const filas = serieMensual.filter((p) => p.anio === anio)
    const ultimo = filas.at(-1)?.mes ?? 0
    porAnio.push({ anio, total: sumar(filas), ultimoMes: ultimo, completo: ultimo === 12 })
  }

  const total = sumar(actual)
  const totalPrevio = hayPrevio ? sumar(previo) : null

  // Modalidades: volumen, participación, variación y prioridad.
  const agrupar = (filas) => {
    const m = new Map()
    for (const r of filas) m.set(r.modalidad, (m.get(r.modalidad) ?? 0) + r.total)
    return m
  }
  const modActual = agrupar(actual)
  const modPrevio = agrupar(previo)
  const porModalidad = [...modActual.entries()]
    .map(([id, t]) => {
      const tPrev = hayPrevio ? modPrevio.get(id) ?? 0 : null
      const item = {
        id,
        modalidad: nombreModalidad(id),
        total: t,
        totalPrevio: tPrev,
        participacion: total ? Number(((t / total) * 100).toFixed(1)) : 0,
        variacion: hayPrevio ? variacionPorcentual(t, tPrev) : null,
      }
      item.prioridad = prioridadDe({ ...item, modalidad: id })
      return item
    })
    .sort((a, b) => b.total - a.total)

  // Estacionalidad: promedio de cada mes del año dentro del periodo.
  const estacionalidad = Array.from({ length: 12 }, (_, i) => {
    const valores = serieMensual.filter((p) => p.mes === i + 1)
    return { mes: i + 1, promedio: valores.length ? Math.round(sumar(valores) / valores.length) : 0 }
  })

  const mesPico = serieMensual.reduce((a, b) => (b.total > a.total ? b : a), serieMensual[0])

  const totalLima = sumar(rankingDistritos)
  const posicion = rankingDistritos.findIndex((d) => d.ubigeo === ubigeo) + 1
  const nombres = new Map(meta.distritos.map((d) => [d.ubigeo, d.nombre]))
  const rankingLista = rankingDistritos
    .map((d, i) => ({ posicion: i + 1, ubigeo: d.ubigeo, distrito: nombres.get(d.ubigeo), total: d.total }))
    .filter((d) => d.posicion <= TOP_RANKING || d.ubigeo === ubigeo)

  const ranking = {
    posicion: posicion || null,
    de: rankingDistritos.length,
    participacion: totalLima ? Number(((total / totalLima) * 100).toFixed(1)) : 0,
    totalLima,
    lista: rankingLista,
  }

  const kpis = {
    total,
    totalPrevio,
    variacion: hayPrevio ? variacionPorcentual(total, totalPrevio) : null,
    promedioMensual: serieMensual.length ? Math.round(total / serieMensual.length) : 0,
    meses: serieMensual.length,
    mesPico,
  }

  const periodo = etiquetaPeriodo(desde, hasta, ultimoMes)
  const periodoPrevio = hayPrevio ? etiquetaPeriodo(desdePrev, hastaPrev, ultimoMes) : null

  return {
    filtros: { distrito: filtros.distrito, desde, hasta, modalidades },
    periodo,
    periodoPrevio,
    kpis,
    serieMensual,
    porAnio,
    porModalidad,
    estacionalidad,
    ranking,
    hallazgos: generarHallazgos({ filtros, kpis, porAnio, porModalidad, estacionalidad, ranking, periodo }),
    fuente: FUENTE_DENUNCIAS,
  }
}
