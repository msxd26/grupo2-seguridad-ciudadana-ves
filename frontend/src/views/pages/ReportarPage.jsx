import { Link } from 'react-router-dom'
import { CircleMarker } from 'react-leaflet'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../controllers/useAsync'
import { useReporteForm } from '../../controllers/useReporteForm'
import { fetchLimite, fetchTiposReporte } from '../../services/seguridadService'
import MapaBase from '../components/mapa/MapaBase'
import '../../assets/styles/mapa.css'
import '../../assets/styles/paginas.css'

const MAX_DESC = 500

export default function ReportarPage() {
  const { usuario } = useAuth()
  const tipos = useAsync((signal) => fetchTiposReporte(signal), [])
  const limite = useAsync((signal) => fetchLimite(signal), [])
  const form = useReporteForm(limite.data?.limite)
  const { valores, errores } = form

  if (form.enviado) {
    const r = form.enviado
    return (
      <section className="pagina container">
        <div className="exito" role="status">
          <h1>¡Gracias! Tu reporte fue registrado</h1>
          <p>
            Reporte <strong>#{r.id}</strong> · {r.tipo}. Quedó en estado <strong>pendiente</strong> de verificación y ya
            se refleja en el mapa de riesgo.{usuario ? <> Puedes seguir su estado en <Link to="/mi-cuenta">Mi cuenta</Link>.</> : null}
          </p>
          <div className="exito__acciones">
            <Link className="btn btn--primario" to={`/mapa?lat=${r.lat}&lng=${r.lng}`}>Ver en el mapa</Link>
            <button type="button" className="btn btn--secundario" onClick={form.nuevo}>Hacer otro reporte</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Reportar un incidente</h1>
        {usuario ? (
          <p>
            Hola, <strong>{usuario.nombre.split(' ')[0]}</strong>. Este reporte quedará en <Link to="/mi-cuenta">tu historial</Link> para que
            sigas su estado. En el mapa público se muestra sin tu nombre.
          </p>
        ) : (
          <p>
            Tu reporte es <strong>anónimo</strong>: no pedimos nombre, DNI ni teléfono. <Link to="/ingresar?volver=/reportar">Ingresa</Link> si
            quieres hacer seguimiento a tus reportes.
          </p>
        )}
      </header>

      <div className="aviso-emergencia" role="note">
        <strong>¿Es una emergencia en curso?</strong> Llama de inmediato a la Policía al <a href="tel:105">105</a>. Este
        formulario no reemplaza una denuncia policial.
      </div>

      <form className="reporte" onSubmit={form.enviar} noValidate>
        <div className="reporte__campos">
          <div className="campo">
            <label htmlFor="r-tipo">Tipo de incidente *</label>
            <select id="r-tipo" value={valores.tipo} onChange={(e) => form.setCampo('tipo', e.target.value)} aria-invalid={Boolean(errores.tipo)}>
              <option value="">Selecciona…</option>
              {(tipos.data ?? []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errores.tipo ? <span className="campo__error">{errores.tipo}</span> : null}
          </div>

          <div className="campo">
            <label htmlFor="r-fecha">Fecha y hora *</label>
            <input id="r-fecha" type="datetime-local" value={valores.fechaHecho} onChange={(e) => form.setCampo('fechaHecho', e.target.value)} aria-invalid={Boolean(errores.fechaHecho)} />
            {errores.fechaHecho ? <span className="campo__error">{errores.fechaHecho}</span> : null}
          </div>

          <div className="campo">
            <label htmlFor="r-desc">¿Qué ocurrió? *</label>
            <textarea
              id="r-desc"
              rows={5}
              maxLength={MAX_DESC}
              value={valores.descripcion}
              onChange={(e) => form.setCampo('descripcion', e.target.value)}
              placeholder="Ej.: Dos personas en moto robaron un celular a la salida del paradero."
              aria-invalid={Boolean(errores.descripcion)}
            />
            <span className="campo__ayuda">{valores.descripcion.length}/{MAX_DESC} · No incluyas datos personales.</span>
            {errores.descripcion ? <span className="campo__error">{errores.descripcion}</span> : null}
          </div>

          <div className="campo">
            <label htmlFor="r-ref">Referencia (opcional)</label>
            <input id="r-ref" type="text" maxLength={200} value={valores.referencia} onChange={(e) => form.setCampo('referencia', e.target.value)} placeholder="Ej.: Av. Revolución con Av. Central" />
          </div>

          {form.errorGeneral ? <div className="form-error" role="alert">{form.errorGeneral}</div> : null}

          <button type="submit" className="btn btn--alert reporte__enviar" disabled={form.enviando}>
            {form.enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>

        <div className="reporte__mapa">
          <span className="campo__label">Ubicación * <small>(haz clic en el mapa)</small></span>
          <MapaBase limite={limite.data?.limite} zoom={13} onClick={form.setUbicacion} className="mapa mapa--form">
            {valores.ubicacion ? (
              <CircleMarker center={[valores.ubicacion.lat, valores.ubicacion.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#e5383b', fillOpacity: 1 }} />
            ) : null}
          </MapaBase>
          {valores.ubicacion ? (
            <span className="campo__ayuda">Ubicación marcada: {valores.ubicacion.lat.toFixed(5)}, {valores.ubicacion.lng.toFixed(5)}</span>
          ) : null}
          {errores.ubicacion ? <span className="campo__error">{errores.ubicacion}</span> : null}
        </div>
      </form>
    </section>
  )
}
