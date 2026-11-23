import { useState } from 'react'
import { CircleMarker } from 'react-leaflet'
import MapaBase from '../mapa/MapaBase'
import { puntoEnPoligono } from '../../../models/mapa'
import { IconoUbicacion } from '../../../models/iconos'
import '../../../assets/styles/mapa.css'

// Elegir la ubicación del incidente: GPS del celular o un toque en el mapa.
export default function UbicacionSelector({ limite, valor, onCambiar, error, grande = false, altura = 360 }) {
  const [estadoGps, setEstadoGps] = useState(null) // null | 'buscando' | mensaje de error
  const [destino, setDestino] = useState(null)
  const [aviso, setAviso] = useState(null)

  const fijar = (lat, lng) => {
    if (!puntoEnPoligono(lat, lng, limite)) {
      setAviso('Ese punto está fuera de Villa El Salvador. Toca un lugar dentro del borde del distrito.')
      return false
    }
    setAviso(null)
    onCambiar({ lat, lng })
    return true
  }

  const usarGps = () => {
    if (!navigator.geolocation) {
      setEstadoGps('Tu navegador no permite obtener la ubicación. Toca el mapa.')
      return
    }
    setEstadoGps('buscando')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const ok = fijar(coords.latitude, coords.longitude)
        setEstadoGps(ok ? null : 'Tu ubicación actual está fuera de Villa El Salvador. Toca el mapa para marcar el lugar.')
        if (ok) setDestino({ lat: coords.latitude, lng: coords.longitude, zoom: 17 })
      },
      () => setEstadoGps('No pudimos obtener tu ubicación. Toca el mapa para marcar el lugar.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const mensaje = aviso ?? (estadoGps && estadoGps !== 'buscando' ? estadoGps : null) ?? error

  return (
    <div className={grande ? 'ubicacion ubicacion--grande' : 'ubicacion'}>
      <button type="button" className="ubicacion__gps" onClick={usarGps} disabled={estadoGps === 'buscando'}>
        <IconoUbicacion size={grande ? 24 : 18} aria-hidden="true" />
        {estadoGps === 'buscando' ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'}
      </button>
      <span className="ubicacion__o">— o toca el mapa —</span>
      <div className="ubicacion__mapa" style={{ height: altura }}>
        <MapaBase limite={limite} zoom={13} destino={destino} onClick={fijar} className="mapa mapa--form">
          {valor ? (
            <CircleMarker center={[valor.lat, valor.lng]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#DC2626', fillOpacity: 1 }} />
          ) : null}
        </MapaBase>
      </div>
      {valor ? <span className="ubicacion__ok">✓ Lugar marcado</span> : null}
      {mensaje ? <span className="campo__error" role="alert">{mensaje}</span> : null}
    </div>
  )
}
