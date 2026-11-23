import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Marker, Popup, Rectangle, Tooltip, useMap } from 'react-leaflet'
import { NIVELES_ZONA, enlaceOsm } from '../../../models/mapa'
import { iconoMarcador } from './iconosMarcador'
import { MODOS, etiquetaTipo, haceCuanto, tipoDe } from '../../../models/tipos'
import { confirmarReporte, marcarFalso } from '../../../services/seguridadService'

// Ícono de punto seguro / comisaría (SVG en línea; evita las imágenes por defecto de Leaflet).
const ICONO_COMISARIA = L.divIcon({
  className: 'icono-comisaria',
  html: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" fill="#16A34A" stroke="#fff" stroke-width="1.5"/><path d="M8.5 12.5l2.3 2.3 4.7-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -12],
})

export function CapaComisarias({ comisarias }) {
  return comisarias.map((c) => (
    <Marker key={c.codigo} position={[c.lat, c.lng]} icon={ICONO_COMISARIA}>
      <Popup>
        <strong>{c.nombre}</strong>
        <br />
        Punto seguro · {c.distrito}
        <br />
        <a href="tel:105">Llamar al 105</a> · <a href={enlaceOsm(c.lat, c.lng)} target="_blank" rel="noreferrer">Cómo llegar</a>
      </Popup>
    </Marker>
  ))
}

// Botón "Marcar como falso" dentro del popup (moderación comunitaria).
function MarcarFalso({ id, onOculto }) {
  const [estado, setEstado] = useState(null)
  const marcar = async () => {
    setEstado('enviando')
    try {
      const r = await marcarFalso(id)
      setEstado(r.oculto ? 'Gracias. El reporte quedó oculto hasta que lo revise un moderador.' : `Gracias por avisar (${r.marcas}/3 marcas).`)
      if (r.oculto) onOculto?.(id)
    } catch (err) {
      setEstado(err.message)
    }
  }
  if (estado && estado !== 'enviando') return <p className="popup-nota">{estado}</p>
  return (
    <button type="button" className="popup-marcar" onClick={marcar} disabled={estado === 'enviando'}>
      🚩 Marcar como falso
    </button>
  )
}

// "Yo también lo vi": confirma el reporte; el conteo se actualiza en vivo para todos.
function Confirmar({ id, total }) {
  const [estado, setEstado] = useState(null)
  const confirmar = async () => {
    setEstado('enviando')
    try {
      await confirmarReporte(id)
      setEstado('ok')
    } catch (err) {
      setEstado(err.message)
    }
  }
  return (
    <div className="popup-confirmar">
      <button type="button" onClick={confirmar} disabled={estado === 'enviando' || estado === 'ok'}>
        👀 {estado === 'ok' ? '¡Gracias!' : 'Yo también lo vi'}
      </button>
      <span>{total} vecino{total === 1 ? '' : 's'} lo confirman</span>
      {estado && estado !== 'ok' && estado !== 'enviando' ? <p className="popup-nota">{estado}</p> : null}
    </div>
  )
}

export function CapaReportes({ reportes, nuevos, onOculto, abrirId }) {
  const refs = useRef(new Map())
  const map = useMap()

  // Abre la ficha del reporte elegido (lista "En vivo" o reporte nuevo) cuando el mapa termina de moverse.
  useEffect(() => {
    if (!abrirId) return undefined
    const abrir = () => refs.current.get(abrirId)?.openPopup()
    abrir()
    map.once('moveend', abrir)
    return () => map.off('moveend', abrir)
  }, [abrirId, map])

  return reportes.map((r) => {
    const tipo = tipoDe(r.tipo)
    const esNuevo = nuevos?.has(r.id)
    return (
      <Marker
        key={r.id}
        ref={(capa) => (capa ? refs.current.set(r.id, capa) : refs.current.delete(r.id))}
        position={[r.lat, r.lng]}
        icon={iconoMarcador(r.tipo, { nuevo: esNuevo, verificado: r.estado === 'verificado' })}
        title={`${tipo.label} · ${haceCuanto(r.fechaHecho)}`}
        alt={tipo.label}
        zIndexOffset={esNuevo ? 1000 : 0}
      >
        <Popup>
          <strong className="popup-tipo" style={{ color: tipo.texto }}>
            <tipo.Icono size={16} aria-hidden="true" /> {tipo.label}
          </strong>
          {r.esDemo ? <span className="badge-demo">DEMO</span> : null}
          {esNuevo ? <span className="badge-nuevo">NUEVO</span> : null}
          <br />
          <small>{haceCuanto(r.fechaHecho)} · vía {MODOS[r.modo] ?? 'formulario'}{r.estado === 'verificado' ? ' · ✓ verificado' : ''}</small>
          <br />
          <span className="popup-desc">{r.descripcion}</span>
          {r.referencia ? <><br /><em>Ref.: {r.referencia}</em></> : null}
          <Confirmar id={r.id} total={r.confirmaciones ?? 0} />
          {r.estado !== 'verificado' ? <MarcarFalso id={r.id} onOculto={onOculto} /> : null}
        </Popup>
      </Marker>
    )
  })
}

export function CapaZonas({ zonas }) {
  return zonas.map((z) => {
    const { color } = NIVELES_ZONA[z.nivel]
    return (
      <Rectangle
        key={z.id}
        bounds={[[z.sur, z.oeste], [z.norte, z.este]]}
        pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: z.nivel === 'alto' ? 0.4 : z.nivel === 'medio' ? 0.28 : 0.14 }}
      >
        <Tooltip sticky>
          {z.cantidad} reporte{z.cantidad === 1 ? '' : 's'} · principal: {etiquetaTipo(z.tipoPrincipal)}
          {z.soloDemo ? ' (demo)' : ''}
        </Tooltip>
      </Rectangle>
    )
  })
}
