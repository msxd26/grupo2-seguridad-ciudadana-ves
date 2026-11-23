import { useEffect } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CENTRO_VES, TILE_ATTRIBUTION, TILE_URL, ZOOM_INICIAL } from '../../../models/mapa'

const ESTILO_LIMITE = { color: '#0f1b2d', weight: 2.5, fillColor: '#f5b301', fillOpacity: 0.06, dashArray: null }

// Mueve el mapa cuando cambia `destino`: un punto ({ lat, lng, zoom }) o un área ({ limites: [s, o, n, e] }).
function Volar({ destino }) {
  const map = useMap()
  useEffect(() => {
    if (!destino) return
    if (destino.limites) {
      const [s, o, n, e] = destino.limites
      map.closePopup() // al encuadrar varios reportes no queda abierta la ficha de uno solo
      map.flyToBounds([[s, o], [n, e]], { duration: 0.8, maxZoom: 17, padding: [24, 24] })
    } else {
      map.flyTo([destino.lat, destino.lng], destino.zoom ?? 17, { duration: 0.8 })
    }
  }, [destino, map])
  return null
}

function Clicks({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) })
  return null
}

// Para miniaturas: un mapa que solo muestra (sin arrastrar, zoom ni teclado).
const SIN_INTERACCION = {
  dragging: false, zoomControl: false, scrollWheelZoom: false, doubleClickZoom: false,
  touchZoom: false, boxZoom: false, keyboard: false,
}

// Mapa base de Villa El Salvador con el límite distrital.
export default function MapaBase({ limite, centro = CENTRO_VES, zoom = ZOOM_INICIAL, destino, onClick, className, estatico = false, children }) {
  return (
    <MapContainer center={centro} zoom={zoom} className={className} scrollWheelZoom {...(estatico ? SIN_INTERACCION : null)}>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      {limite ? <GeoJSON data={limite} style={ESTILO_LIMITE} interactive={false} /> : null}
      {destino ? <Volar destino={destino} /> : null}
      {onClick ? <Clicks onClick={onClick} /> : null}
      {children}
    </MapContainer>
  )
}
