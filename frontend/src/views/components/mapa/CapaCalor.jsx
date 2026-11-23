import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import './leafletGlobal'
import 'leaflet.heat'
import L from 'leaflet'

// Gradiente de verde (bajo) a rojo (alto), como el semáforo del plan.
const GRADIENTE = { 0.2: '#16A34A', 0.45: '#FACC15', 0.7: '#F97316', 1: '#DC2626' }

// Mapa de calor por densidad de reportes. `puntos`: [[lat, lng], ...]
export default function CapaCalor({ puntos }) {
  const map = useMap()

  useEffect(() => {
    if (!puntos.length) return
    const capa = L.heatLayer(puntos, { radius: 28, blur: 22, maxZoom: 16, minOpacity: 0.35, gradient: GRADIENTE }).addTo(map)
    return () => {
      map.removeLayer(capa)
    }
  }, [map, puntos])

  return null
}
