import { TIPOS, distanciaMetros, tipoDe } from './tipos'

// Preferencias de avisos (iguales en la web y en la app Android):
//   A) cercanía: radio desde mi ubicación (o todo el distrito)
//   B) ráfagas: varios reportes seguidos se agrupan en UN solo aviso
//   C) tipos: solo ciertos tipos o solo nivel "Peligro"
// El filtro se aplica en el dispositivo: la ubicación nunca se envía al servidor.

export const RADIOS = [
  { metros: 500, label: '500 m' },
  { metros: 1000, label: '1 km' },
  { metros: 2000, label: '2 km' },
  { metros: null, label: 'Todo el distrito' },
]

export const CONFIG_INICIAL = { radio: null, lat: null, lng: null, tipos: [], soloPeligro: false }

const PLURAL = {
  robo: 'robos',
  intento_robo: 'intentos de robo',
  acoso: 'acosos',
  actividad_sospechosa: 'actividades sospechosas',
  zona_oscura: 'zonas oscuras',
  espacio_abandonado: 'espacios abandonados',
  otro: 'otros',
}

export const TIPOS_AVISO = TIPOS

// ¿Este reporte debe generar un aviso con esta configuración?
export function cumpleFiltro(c, r) {
  if (!c) return false
  const t = tipoDe(r.tipo)
  if (c.soloPeligro && t.nivel !== 'peligro') return false
  if (c.tipos?.length && !c.tipos.includes(t.id)) return false
  if (c.radio) {
    if (c.lat === null || c.lng === null) return false
    if (distanciaMetros(c.lat, c.lng, r.lat, r.lng) > c.radio) return false
  }
  return true
}

export const distanciaDesde = (c, r) => (c?.radio && c.lat !== null ? distanciaMetros(c.lat, c.lng, r.lat, r.lng) : null)
export const formatoDistancia = (d) => (d < 1000 ? `${Math.round(d / 10) * 10} m` : `${(d / 1000).toFixed(1)} km`)

// "3 robos, 2 acosos y 1 zona oscura"
export function resumenTipos(lista) {
  const cuenta = new Map()
  for (const r of lista) cuenta.set(tipoDe(r.tipo).id, (cuenta.get(tipoDe(r.tipo).id) ?? 0) + 1)
  const partes = [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `${n} ${n === 1 ? tipoDe(id).label.toLowerCase() : PLURAL[id]}`)
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : partes[0] ?? ''
}

// Rectángulo que contiene todos los reportes (para encuadrar el mapa), con un pequeño margen.
export function encuadreDe(lista) {
  let s = Infinity, w = Infinity, n = -Infinity, e = -Infinity
  for (const r of lista) {
    s = Math.min(s, r.lat); n = Math.max(n, r.lat)
    w = Math.min(w, r.lng); e = Math.max(e, r.lng)
  }
  const m = 0.002
  return [s - m, w - m, n + m, e + m].map((v) => Number(v.toFixed(5)))
}

export const enlaceMapa = (lista) =>
  lista.length === 1 ? `/mapa?lat=${lista[0].lat}&lng=${lista[0].lng}` : `/mapa?encuadre=${encuadreDe(lista).join(',')}`

// B) Agrupador de ráfagas: junta los reportes que llegan seguidos y entrega UN lote.
//    - Se entrega tras `silencioMs` sin reportes nuevos (o al llegar a `maximoMs`).
//    - Si el servidor anunció una ráfaga, espera a que termine.
export function crearAgrupador(alEntregar, { silencioMs = 4000, maximoMs = 30000 } = {}) {
  let lote = []
  let tSilencio = null
  let tMaximo = null
  let enRafaga = false

  const entregar = () => {
    clearTimeout(tSilencio); clearTimeout(tMaximo)
    tSilencio = tMaximo = null
    const salida = lote
    lote = []
    enRafaga = false
    if (salida.length) alEntregar(salida)
  }
  const reprogramar = () => {
    clearTimeout(tSilencio)
    if (!enRafaga) tSilencio = setTimeout(entregar, silencioMs)
    if (!tMaximo) tMaximo = setTimeout(entregar, maximoMs)
  }

  return {
    agregar(r) {
      if (lote.some((x) => x.id === r.id)) return
      lote.push(r)
      reprogramar()
    },
    rafaga(estado) {
      if (estado === 'iniciada') { enRafaga = true; clearTimeout(tSilencio); if (!tMaximo) tMaximo = setTimeout(entregar, maximoMs) }
      if (estado === 'terminada') { enRafaga = false; if (lote.length) { clearTimeout(tSilencio); tSilencio = setTimeout(entregar, 1500) } }
    },
    detener() { clearTimeout(tSilencio); clearTimeout(tMaximo); lote = [] },
  }
}
