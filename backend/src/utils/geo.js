import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Límite de Villa El Salvador (OpenStreetMap). Se lee una sola vez al iniciar.
const geojson = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'data', 'ves_limite.geojson'), 'utf8'))
const anillo = geojson.features[0].geometry.coordinates[0] // [[lng, lat], ...]

function calcularBbox(puntos) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  for (const [lng, lat] of puntos) {
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  return [minLng, minLat, maxLng, maxLat]
}

export const LIMITE_VES = { geojson, bbox: calcularBbox(anillo) }

// Algoritmo de ray casting: ¿el punto está dentro del distrito?
export function puntoEnPoligono(lat, lng) {
  const [minLng, minLat, maxLng, maxLat] = LIMITE_VES.bbox
  if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) return false
  let dentro = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

// Celda de una cuadrícula de ~330 m para agrupar reportes en zonas.
export const TAMANO_CELDA = 0.003
export function celdaDe(lat, lng) {
  const fila = Math.floor(lat / TAMANO_CELDA)
  const col = Math.floor(lng / TAMANO_CELDA)
  return {
    id: `${fila}_${col}`,
    sur: fila * TAMANO_CELDA,
    oeste: col * TAMANO_CELDA,
    norte: (fila + 1) * TAMANO_CELDA,
    este: (col + 1) * TAMANO_CELDA,
  }
}
