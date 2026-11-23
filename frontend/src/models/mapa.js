// Modelo: configuración del mapa de Villa El Salvador.

export const CENTRO_VES = [-12.2175, -76.9435]
export const ZOOM_INICIAL = 14

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const PERIODOS = [
  { dias: 1, label: '24 h' },
  { dias: 7, label: '7 días' },
  { dias: 30, label: '30 días' },
  { dias: 90, label: '90 días' },
]

// Colores de las zonas por nivel de concentración.
export const NIVELES_ZONA = {
  alto: { label: 'Alta concentración (5+)', color: '#c1272d' },
  medio: { label: 'Concentración media (3–4)', color: '#e07b00' },
  bajo: { label: 'Baja (1–2)', color: '#eda100' },
}

// Color del marcador según el tipo de incidente.
export { colorTipo as colorDeTipo } from './tipos'

// ¿El punto está dentro del límite? (validación inmediata; el backend vuelve a validar)
export function puntoEnPoligono(lat, lng, geojson) {
  const anillo = geojson?.features?.[0]?.geometry?.coordinates?.[0]
  if (!anillo) return true
  let dentro = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

export const enlaceOsm = (lat, lng) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
