import L from 'leaflet'
import { CircleMarker, Marker, Popup, Rectangle, Tooltip } from 'react-leaflet'
import { NIVELES_ZONA, colorDeTipo, enlaceOsm } from '../../../models/mapa'

const fechaHora = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

// Ícono de comisaría (SVG en línea; evita las imágenes por defecto de Leaflet).
const ICONO_COMISARIA = L.divIcon({
  className: 'icono-comisaria',
  html: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" fill="#0f1b2d" stroke="#fff" stroke-width="1.5"/><path d="M8.5 12.5l2.3 2.3 4.7-5" fill="none" stroke="#f5b301" stroke-width="2" stroke-linecap="round"/></svg>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -12],
})

export function CapaComisarias({ comisarias }) {
  return comisarias.map((c) => (
    <Marker key={c.codigo} position={[c.lat, c.lng]} icon={ICONO_COMISARIA}>
      <Popup>
        <strong>{c.nombre}</strong>
        <br />
        {c.distrito} · {c.divpol}
        <br />
        <a href={enlaceOsm(c.lat, c.lng)} target="_blank" rel="noreferrer">Ver en OpenStreetMap</a>
      </Popup>
    </Marker>
  ))
}

export function CapaReportes({ reportes }) {
  return reportes.map((r) => (
    <CircleMarker
      key={r.id}
      center={[r.lat, r.lng]}
      radius={6}
      pathOptions={{ color: '#fff', weight: 2, fillColor: colorDeTipo(r.tipo), fillOpacity: 0.95 }}
    >
      <Popup>
        <strong>{r.tipo}</strong>
        {r.esDemo ? <span className="badge-demo">DEMO</span> : null}
        <br />
        {fechaHora.format(new Date(r.fechaHecho))}
        <br />
        <span className="popup-desc">{r.descripcion}</span>
        {r.referencia ? <><br /><em>Ref.: {r.referencia}</em></> : null}
        <br />
        <small>Estado: {r.estado}</small>
      </Popup>
    </CircleMarker>
  ))
}

export function CapaZonas({ zonas }) {
  return zonas.map((z) => {
    const { color } = NIVELES_ZONA[z.nivel]
    return (
      <Rectangle
        key={z.id}
        bounds={[[z.sur, z.oeste], [z.norte, z.este]]}
        pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: z.nivel === 'alto' ? 0.42 : z.nivel === 'medio' ? 0.3 : 0.16 }}
      >
        <Tooltip sticky>
          {z.cantidad} reporte{z.cantidad === 1 ? '' : 's'} · principal: {z.tipoPrincipal}
          {z.soloDemo ? ' (demo)' : ''}
        </Tooltip>
      </Rectangle>
    )
  })
}
