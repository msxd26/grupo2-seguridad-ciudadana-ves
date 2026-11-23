import { ReporteModel } from '../models/ReporteModel.js'
import { ComisariaModel } from '../models/ComisariaModel.js'
import { TIPOS_INCIDENTE, etiquetaTipo } from '../config/fuente.js'
import { distanciaMetros } from '../utils/geo.js'
import { variacionPorcentual } from '../utils/texto.js'
import { calcularZonas } from './mapaService.js'
import { parsearDias } from './reportesService.js'

// Acción sugerida para la municipalidad según el tipo dominante de la zona.
const ACCIONES = {
  robo: 'Reforzar patrullaje de serenazgo',
  intento_robo: 'Reforzar patrullaje en horas punta',
  acoso: 'Patrullaje y campaña de prevención del acoso',
  actividad_sospechosa: 'Ronda de serenazgo y coordinación con la PNP',
  zona_oscura: 'Solicitar reparación de alumbrado público',
  espacio_abandonado: 'Recuperar o limpiar el espacio',
  otro: 'Evaluar en campo',
}

const zonaHoraria = 'America/Lima'
const claveDia = new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }) // AAAA-MM-DD
const horaLima = new Intl.DateTimeFormat('en-GB', { timeZone: zonaHoraria, hour: '2-digit', hourCycle: 'h23' })

// Comisaría más cercana como referencia para nombrar cada zona.
function referenciaCercana(lat, lng, comisarias) {
  let mejor = null
  for (const c of comisarias) {
    const d = distanciaMetros(lat, lng, c.lat, c.lng)
    if (!mejor || d < mejor.distancia) mejor = { nombre: c.nombre, distancia: d }
  }
  return mejor ? `a ${Math.round(mejor.distancia / 50) * 50} m de ${mejor.nombre}` : ''
}

// Panel municipal con los reportes ciudadanos (lo que no llega a las denuncias oficiales).
export async function obtenerPanelCiudadano(query) {
  const dias = parsearDias(query.dias)
  const [reportes, previo, comisarias] = await Promise.all([
    ReporteModel.listarRecientes({ dias }),
    ReporteModel.contarVisiblesEntre(dias * 2, dias),
    ComisariaModel.listar(),
  ])
  const total = reportes.length

  const conteo = new Map(TIPOS_INCIDENTE.map((t) => [t.id, 0]))
  const porModo = { formulario: 0, chat: 0, guiado: 0 }
  const porHora = Array.from({ length: 24 }, (_, h) => ({ hora: h, total: 0 }))
  const porDiaMap = new Map()
  for (const r of reportes) {
    conteo.set(r.tipo, (conteo.get(r.tipo) ?? 0) + 1)
    porModo[r.modo] = (porModo[r.modo] ?? 0) + 1
    const fecha = new Date(r.fechaHecho)
    porHora[Number(horaLima.format(fecha))].total++
    const dia = claveDia.format(fecha)
    porDiaMap.set(dia, (porDiaMap.get(dia) ?? 0) + 1)
  }

  const porTipo = [...conteo.entries()]
    .map(([tipo, n]) => ({ tipo, label: etiquetaTipo(tipo), total: n, porcentaje: total ? Math.round((n / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)

  // Serie diaria completa (incluye días sin reportes).
  const porDia = Array.from({ length: dias }, (_, i) => {
    const fecha = new Date(Date.now() - (dias - 1 - i) * 86_400_000)
    const dia = claveDia.format(fecha)
    return { dia, total: porDiaMap.get(dia) ?? 0 }
  })

  const zonas = calcularZonas(reportes)
  const criticas = zonas.filter((z) => z.nivel !== 'bajo')
  const topZonas = zonas.slice(0, 5).map((z) => {
    const lat = (z.sur + z.norte) / 2
    const lng = (z.oeste + z.este) / 2
    return {
      id: z.id,
      lat,
      lng,
      cantidad: z.cantidad,
      nivel: z.nivel,
      tipoDominante: z.tipoPrincipal,
      tipoDominanteLabel: etiquetaTipo(z.tipoPrincipal),
      referencia: referenciaCercana(lat, lng, comisarias),
      accion: ACCIONES[z.tipoPrincipal] ?? ACCIONES.otro,
      soloDemo: z.soloDemo,
    }
  })

  const horaPico = porHora.reduce((a, b) => (b.total > a.total ? b : a), porHora[0])

  return {
    dias,
    kpis: {
      total,
      totalPrevio: previo,
      variacion: variacionPorcentual(total, previo),
      zonasCriticas: criticas.length,
      tipoPrincipal: total ? porTipo[0] : null,
      horaPico: total ? horaPico : null,
      // Inclusión digital (ODS 10): reportes hechos con chat IA o modo guiado.
      accesibles: porModo.chat + porModo.guiado,
    },
    porTipo,
    porDia,
    porHora,
    porModo,
    topZonas,
    puntos: reportes.map((r) => [r.lat, r.lng]),
    hayDemo: reportes.some((r) => r.esDemo),
  }
}
