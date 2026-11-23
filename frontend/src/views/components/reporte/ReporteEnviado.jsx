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
      <span className="exito__check" aria-hidden="true">✓</span>
      <Titulo>¡Reporte enviado! Gracias, vecino/a</Titulo>

      <ul className="exito__resumen" aria-label="Resumen del reporte">
        <li>
          <strong style={{ color: tipo.texto }}><tipo.Icono size={20} aria-hidden="true" /> {tipo.label}</strong>
        </li>
        <li><span aria-hidden="true">📍</span> {reporte.referencia || 'Lugar marcado en el mapa'}</li>
        <li><span aria-hidden="true">🕐</span> {haceCuanto(reporte.fechaHecho)} · <span aria-hidden="true">🔒</span> Tu nombre no se muestra</li>
      </ul>

      <p>
        Ya aparece en el mapa de todos los vecinos (reporte #{reporte.id}).
        {usuario ? <> Puedes seguir su estado en <Link to="/mi-cuenta">Mi cuenta</Link>.</> : null}
      </p>
      <div className="exito__acciones">
        <Link className="btn btn--primario" to={`/mapa?lat=${reporte.lat}&lng=${reporte.lng}`}>Ver en el mapa →</Link>
        <button type="button" className="btn btn--secundario" onClick={onOtro}>Hacer otro reporte</button>
      </div>
    </div>
  )
}
