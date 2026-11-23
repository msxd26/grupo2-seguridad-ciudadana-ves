import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { haceCuanto, tipoDe } from '../../../models/tipos'

// Pantalla de éxito: muestra lo que se guardó (tipo, lugar, cuándo) para que el vecino confíe en el resultado.
// `dentroDeChat` usa un h2 porque la página del chat ya tiene su h1.
export default function ReporteEnviado({ reporte, onOtro, dentroDeChat = false }) {
  const { usuario } = useAuth()
  const tipo = tipoDe(reporte.tipo)
  const Titulo = dentroDeChat ? 'h2' : 'h1'
  return (
    <div className="exito" role="status">
      <span className="exito__check" aria-hidden="true">
        <svg viewBox="0 0 52 52" width="40" height="40"><path d="M14 27 l8 8 l16 -18" /></svg>
      </span>
      <Titulo>¡Gracias, vecino/a!</Titulo>
      <p className="exito__sub">Tu reporte ya está visible. Acabas de hacer Villa El Salvador un poco más segura.</p>

      <ul className="exito__resumen" aria-label="Resumen del reporte">
        <li>
          <strong style={{ color: tipo.texto }}><tipo.Icono size={20} aria-hidden="true" /> {tipo.label}</strong>
        </li>
        <li><span aria-hidden="true">📍</span> {reporte.referencia || 'Lugar marcado en el mapa'}</li>
        <li><span aria-hidden="true">🕐</span> {haceCuanto(reporte.fechaHecho)} · <span aria-hidden="true">🔒</span> Anónimo</li>
      </ul>

      <p className="exito__impacto">Con tu reporte, el serenazgo puede priorizar esta zona esta noche.</p>
      <p>
        Ya aparece en el mapa de todos los vecinos (reporte #{reporte.id}).
        {usuario ? <> Puedes seguir su estado en <Link to="/mi-cuenta">Mi cuenta</Link>.</> : null}
      </p>
      <div className="exito__acciones">
        <Link className="btn btn--primario" to={`/mapa?lat=${reporte.lat}&lng=${reporte.lng}`}>Ver en el mapa →</Link>
        <button type="button" className="btn btn--secundario" onClick={onOtro}>+ Reportar otro incidente</button>
      </div>
    </div>
  )
}
