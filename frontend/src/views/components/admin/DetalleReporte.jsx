import { useEffect, useState } from 'react'
import { CircleMarker } from 'react-leaflet'
import MapaBase from '../mapa/MapaBase'
import { ESTADOS_REPORTE } from '../../../models/reportes'
import { colorDeTipo } from '../../../models/mapa'
import { MODOS, etiquetaTipo } from '../../../models/tipos'
import '../../../assets/styles/mapa.css'

const fechaLarga = new Intl.DateTimeFormat('es-PE', { dateStyle: 'full', timeStyle: 'short' })

// Panel lateral con el detalle del reporte y las acciones de moderación.
export default function DetalleReporte({ reporte, onCerrar, onModerar }) {
  const [comentario, setComentario] = useState(reporte.comentarioAdmin ?? '')
  const [enviando, setEnviando] = useState(null)
  const [error, setError] = useState(null)
  const [hecho, setHecho] = useState(null)

  useEffect(() => {
    const escape = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onCerrar])

  const accion = async (estado) => {
    setEnviando(estado)
    setError(null)
    try {
      await onModerar(reporte.id, estado, comentario)
      setHecho(`Reporte marcado como "${ESTADOS_REPORTE[estado].label}".`)
    } catch (err) {
      setError(err.detalles?.comentario ?? err.message)
    } finally {
      setEnviando(null)
    }
  }

  return (
    <>
      <button type="button" className="adm-velo adm-velo--detalle" aria-label="Cerrar detalle" onClick={onCerrar} />
      <aside className="adm-detalle" aria-label={`Reporte ${reporte.id}`}>
        <header className="adm-detalle__cabecera">
          <div>
            <span className="adm-mono">Reporte #{reporte.id}</span>
            <h2>{etiquetaTipo(reporte.tipo)}{reporte.esDemo ? <span className="badge-demo">DEMO</span> : null}</h2>
          </div>
          <button type="button" className="adm-detalle__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        </header>

        <div className="adm-detalle__cuerpo">
          <span className={`adm-estado adm-estado--${reporte.estado}`}>{ESTADOS_REPORTE[reporte.estado].label}</span>

          <dl className="adm-datos">
            <dt>Descripción</dt><dd>{reporte.descripcion}</dd>
            <dt>Canal</dt><dd>{MODOS[reporte.modo] ?? 'Formulario'}</dd>
            {reporte.marcas ? <><dt>Comunidad</dt><dd>🚩 {reporte.marcas} marca(s) como falso{reporte.oculto ? ' · oculto del mapa hasta tu revisión' : ''}</dd></> : null}
            {reporte.referencia ? <><dt>Referencia</dt><dd>{reporte.referencia}</dd></> : null}
            <dt>Fecha del hecho</dt><dd>{fechaLarga.format(new Date(reporte.fechaHecho))}</dd>
            <dt>Autor</dt><dd>{reporte.autor ? `${reporte.autor.nombre} (${reporte.autor.email})` : 'Anónimo'}</dd>
            {reporte.revisor ? <><dt>Revisado por</dt><dd>{reporte.revisor} · {fechaLarga.format(new Date(reporte.revisadoEn))}</dd></> : null}
          </dl>

          <MapaBase centro={[reporte.lat, reporte.lng]} zoom={16} className="mapa adm-detalle__mapa">
            <CircleMarker center={[reporte.lat, reporte.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: colorDeTipo(reporte.tipo), fillOpacity: 1 }} />
          </MapaBase>

          <label className="adm-label" htmlFor="d-comentario">Comentario para el vecino</label>
          <textarea
            id="d-comentario"
            className="adm-input adm-textarea"
            rows={3}
            maxLength={300}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ej.: Confirmado con serenazgo. / No se encontró evidencia del hecho."
          />
          <span className="adm-muted adm-contador">{comentario.length}/300 · obligatorio al descartar</span>

          {error ? <div className="adm-error" role="alert">{error}</div> : null}
          {hecho ? <div className="adm-ok" role="status">{hecho}</div> : null}
        </div>

        <footer className="adm-detalle__acciones">
          <button type="button" className="adm-boton adm-boton--verificar" disabled={Boolean(enviando)} onClick={() => accion('verificado')}>
            {enviando === 'verificado' ? 'Guardando…' : '✓ Verificar'}
          </button>
          <button type="button" className="adm-boton adm-boton--descartar" disabled={Boolean(enviando)} onClick={() => accion('descartado')}>
            {enviando === 'descartado' ? 'Guardando…' : '✕ Descartar'}
          </button>
          {reporte.estado !== 'pendiente' ? (
            <button type="button" className="adm-boton" disabled={Boolean(enviando)} onClick={() => accion('pendiente')}>Volver a pendiente</button>
          ) : null}
        </footer>
      </aside>
    </>
  )
}
