// Modelo: configuración del mapa de Villa El Salvador.

export const CENTRO_VES = [-12.2175, -76.9435]
export const ZOOM_INICIAL = 14

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const PERIODOS = [
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

// Grupos de tipos de reporte → color del marcador (paleta categórica validada).
const GRUPOS = {
  patrimonio: { label: 'Robo / hurto / estafa', color: '#2a78d6', tipos: ['Robo', 'Hurto', 'Estafa'] },
  violencia: { label: 'Violencia y extorsión', color: '#e34948', tipos: ['Violencia contra la mujer', 'Extorsión', 'Secuestro'] },
  convivencia: {
    label: 'Drogas, pandillaje, alcohol',
    color: '#6250d6',
    tipos: ['Microcomercialización de drogas', 'Pandillaje', 'Consumo de alcohol en vía pública'],
  },
  entorno: { label: 'Zona insegura / otros', color: '#1baf7a', tipos: ['Alumbrado o zona insegura', 'Otro'] },
}
export const GRUPOS_REPORTE = Object.values(GRUPOS)

const colorPorTipo = new Map(GRUPOS_REPORTE.flatMap((g) => g.tipos.map((t) => [t, g.color])))
export const colorDeTipo = (tipo) => colorPorTipo.get(tipo) ?? '#52514e'

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
