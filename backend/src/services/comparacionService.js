// Servicio de comparación entre reportes vecinales y denuncias policiales (SIDPOL).
// Tesis: el 86% de los delitos en Lima no llega a ninguna estadística (INEI ENAPRES 2023).
// Esta función es la prueba visual: "lo oficial no cuenta toda la historia".
//
// LIMITACIÓN DOCUMENTADA: SIDPOL solo tiene totales mensuales por distrito (ubigeo).
// No tiene coordenadas ni sectores. Los totales oficiales se distribuyen de forma
// proporcional entre las celdas con reportes vecinales, como ESTIMACIÓN. Esto se
// advierte claramente en la respuesta y en la UI. Nunca se presentan como datos exactos.

import { pool } from '../config/db.js'
import { UBIGEO_VES, FUENTE_DENUNCIAS } from '../config/fuente.js'
import { celdaDe, TAMANO_CELDA } from '../utils/geo.js'
import { parsearDias } from './reportesService.js'

// Tabla de equivalencias entre modalidades SIDPOL y tipos de Tu Vecino.
// Documentado como parte del diseño (Paso 2 de la propuesta).
// Los tipos vecinos sin equivalente oficial (zona_oscura, espacio_abandonado)
// son la brecha más importante: aparecen en el mapa vecinal pero no en SIDPOL.
export const EQUIV_OFICIAL_A_VECINAL = {
  'Robo': 'robo',
  'Hurto': 'robo',
  'Intento de robo': 'intento_robo',
  'Violencia contra la mujer e integrantes del grupo familiar': 'acoso',
  'Violencia contra la mujer e integrantes': 'acoso',
  'Violencia familiar': 'acoso',
  'Microcomercialización de drogas': 'actividad_sospechosa',
  'Pandillaje': 'actividad_sospechosa',
  'Consumo de alcohol en vía pública': 'actividad_sospechosa',
  // Sin equivalente oficial → zona_oscura, espacio_abandonado (esa es la brecha)
}
// Tipos vecinales que no tienen ninguna modalidad oficial equivalente.
export const TIPOS_SIN_EQUIVALENTE_OFICIAL = ['zona_oscura', 'espacio_abandonado']

// Nivel de brecha según el ratio vecinal/oficial.
function nivelBrecha(ratio) {
  if (ratio >= 3) return 'alta'
  if (ratio >= 1.5) return 'media'
  if (ratio >= 0.5) return 'similar'
  return 'mas_oficial'
}

function fraseBrechaPorTipo(tipoPrincipal, ratio, nivel) {
  const tipos = { robo: 'robos', intento_robo: 'intentos de robo', acoso: 'acoso', actividad_sospechosa: 'actividad sospechosa', otro: 'incidentes' }
  const etiqueta = tipos[tipoPrincipal] ?? 'incidentes'
  if (nivel === 'alta') return `Los vecinos reportaron ${ratio.toFixed(1)}× más ${etiqueta} que lo registrado oficialmente`
  if (nivel === 'media') return `Los vecinos reportan más ${etiqueta} de lo que figura en las estadísticas oficiales`
  if (nivel === 'similar') return `Los reportes vecinales y los datos oficiales son similares para ${etiqueta}`
  return `Las estadísticas oficiales registran más ${etiqueta} de lo que los vecinos han reportado aquí`
}

// Obtiene las denuncias oficiales de VES del periodo indicado, agrupadas por tipo vecinal equivalente.
async function obtenerOficialPorTipo(desdeFecha) {
  const anio = desdeFecha.getFullYear()
  const mes = desdeFecha.getMonth() + 1
  // Tomamos el año en curso más el año anterior para cubrir el periodo
  const [rows] = await pool.query(
    `SELECT modalidad, SUM(cantidad) AS total
       FROM denuncias_policiales
      WHERE ubigeo = ? AND (anio > ? OR (anio = ? AND mes >= ?))
      GROUP BY modalidad`,
    [UBIGEO_VES, anio, anio, mes],
  )
  // Agrupar por tipo vecinal equivalente
  const porTipo = new Map()
  let totalConEquivalente = 0
  for (const r of rows) {
    const tipoVecinal = EQUIV_OFICIAL_A_VECINAL[r.modalidad]
    if (tipoVecinal) {
      const prev = porTipo.get(tipoVecinal) ?? 0
      porTipo.set(tipoVecinal, prev + Number(r.total))
      totalConEquivalente += Number(r.total)
    }
  }
  return { porTipo, totalConEquivalente }
}

// Punto de entrada principal: calcula la brecha por celda para el periodo dado.
export async function obtenerComparacion({ dias: diasRaw, tipo }) {
  const dias = parsearDias(diasRaw)
  const desdeFecha = new Date(Date.now() - dias * 86_400_000)

  // 1. Reportes vecinales del periodo, agrupados por celda y tipo
  const filtroTipo = tipo ? ' AND tipo = ?' : ''
  const params = tipo ? [dias, tipo] : [dias]
  const [rowsVecinal] = await pool.query(
    `SELECT tipo, lat, lng FROM reportes
      WHERE estado <> 'descartado' AND oculto = 0
        AND fecha_hecho >= NOW() - INTERVAL ? DAY${filtroTipo}`,
    params,
  )

  // 2. Totales oficiales del mismo periodo (año/mes) desde SIDPOL
  const { porTipo: oficialPorTipo, totalConEquivalente } = await obtenerOficialPorTipo(desdeFecha)

  // 3. Agrupar reportes vecinales en celdas
  const celdas = new Map()
  for (const r of rowsVecinal) {
    const c = celdaDe(Number(r.lat), Number(r.lng))
    const actual = celdas.get(c.id) ?? { ...c, tipos: {}, total: 0 }
    actual.tipos[r.tipo] = (actual.tipos[r.tipo] ?? 0) + 1
    actual.total++
    celdas.set(c.id, actual)
  }

  const totalVecinal = rowsVecinal.length
  const numCeldas = celdas.size || 1

  // 4. Distribuir totales oficiales entre celdas, proporcional a densidad vecinal
  // NOTA: esto es una estimación. SIDPOL no tiene coordenadas.
  // La distribución se hace proporcional al peso vecinal de la celda sobre el total.
  const zonas = []
  const zonasSinDatos = []

  for (const [, celda] of celdas) {
    const tipoPrincipal = Object.entries(celda.tipos).sort((a, b) => b[1] - a[1])[0][0]
    // Solo los tipos con equivalente oficial contribuyen a la comparación
    const vecinaConEquiv = Object.entries(celda.tipos)
      .filter(([t]) => !TIPOS_SIN_EQUIVALENTE_OFICIAL.includes(t))
      .reduce((s, [, n]) => s + n, 0)

    const peso = totalVecinal > 0 ? celda.total / totalVecinal : 1 / numCeldas
    // Oficial estimado para esta celda, basado en tipo principal con equivalente
    const oficialTipoPrincipal = !TIPOS_SIN_EQUIVALENTE_OFICIAL.includes(tipoPrincipal)
      ? (oficialPorTipo.get(tipoPrincipal) ?? 0)
      : 0
    const oficialEstimado = oficialTipoPrincipal * peso

    // Umbral mínimo de confianza: ≥ 3 reportes vecinales Y tipo con equivalente oficial
    const confianza = celda.total >= 3 && vecinaConEquiv > 0 && oficialEstimado > 0
      ? 'suficiente'
      : celda.total >= 1 && TIPOS_SIN_EQUIVALENTE_OFICIAL.includes(tipoPrincipal)
        ? 'sin_equivalente_oficial'
        : 'insuficiente'

    if (confianza === 'insuficiente') { zonasSinDatos.push(celda.id); continue }

    const ratio = confianza === 'sin_equivalente_oficial'
      ? null // no hay con qué comparar — eso ES la brecha
      : oficialEstimado > 0 ? celda.total / oficialEstimado : 10

    const nivel = ratio === null ? 'sin_equivalente' : nivelBrecha(ratio)

    zonas.push({
      id: celda.id,
      sur: celda.sur, norte: celda.norte, oeste: celda.oeste, este: celda.este,
      vecinal: {
        total: celda.total,
        tipoPrincipal,
        tipos: celda.tipos,
      },
      oficial: {
        estimado: Math.round(oficialEstimado * 10) / 10,
        tipoPrincipal: !TIPOS_SIN_EQUIVALENTE_OFICIAL.includes(tipoPrincipal) ? tipoPrincipal : null,
        nota: 'Estimación proporcional sobre datos SIDPOL por distrito',
      },
      brecha: {
        ratio: ratio !== null ? Math.round(ratio * 10) / 10 : null,
        nivel,
        confianza,
        explicacion: ratio === null
          ? `${tipoPrincipal === 'zona_oscura' ? 'Las zonas oscuras' : 'Los espacios abandonados'} no se registran en las estadísticas policiales. Solo aparecen en los reportes vecinales.`
          : fraseBrechaPorTipo(tipoPrincipal, ratio, nivel),
      },
    })
  }

  const zonasAlta = zonas.filter((z) => z.brecha.nivel === 'alta' || z.brecha.nivel === 'sin_equivalente').length
  const ratioGlobal = totalConEquivalente > 0 ? (totalVecinal / (totalConEquivalente / (dias / 30))).toFixed(1) : null

  return {
    periodo: { dias, desde: desdeFecha.toISOString().slice(0, 10), hasta: new Date().toISOString().slice(0, 10) },
    resumen: {
      totalVecinal,
      totalOficialEstimado: totalConEquivalente,
      zonasConBrechaAlta: zonasAlta,
      tiposSinEquivalenteOficial: TIPOS_SIN_EQUIVALENTE_OFICIAL,
      titularBrecha: ratioGlobal
        ? `Los vecinos reportaron ${ratioGlobal}× más que las estadísticas oficiales este periodo`
        : 'Los vecinos reportaron incidentes que no aparecen en las estadísticas oficiales',
    },
    zonas: zonas.sort((a, b) => (b.brecha.ratio ?? 10) - (a.brecha.ratio ?? 10)),
    zonasSinDatosOficiales: zonasSinDatos,
    aviso: 'Los reportes vecinales no están verificados y reflejan a quienes usan la plataforma. Los datos oficiales son totales por distrito del periodo más reciente disponible en SIDPOL, distribuidos proporcionalmente (estimación). La comparación es una señal, no una prueba.',
    fuenteOficial: {
      entidad: FUENTE_DENUNCIAS.entidad,
      sistema: FUENTE_DENUNCIAS.sistema,
      url: FUENTE_DENUNCIAS.url,
      nota: 'Totales mensuales por distrito. Sin coordenadas. Distribución proporcional por zona es estimada.',
    },
    fuenteVecinal: { nota: 'Reportes ciudadanos de Tu Vecino verificados o pendientes, sin descartados ni ocultos.' },
  }
}
