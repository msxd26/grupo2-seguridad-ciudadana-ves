import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { tipoDe } from '../../../models/tipos'

export default function ReporteEnviado({ reporte, onOtro }) {
  const { usuario } = useAuth()
  const tipo = tipoDe(reporte.tipo)
  return (
    <div className="exito" role="status">
      <span className="exito__check" aria-hidden="true">✓</span>
      <h1>¡Reporte enviado! Gracias, vecino/a</h1>
      <p>
        Tu reporte de <strong>{tipo.label.toLowerCase()}</strong> (#{reporte.id}) ya aparece en el mapa de todos los
        vecinos. {usuario ? <>Puedes seguir su estado en <Link to="/mi-cuenta">Mi cuenta</Link>.</> : null}
      </p>
      <div className="exito__acciones">
        <Link className="btn btn--primario" to={`/mapa?lat=${reporte.lat}&lng=${reporte.lng}`}>Ver en el mapa</Link>
        <button type="button" className="btn btn--secundario" onClick={onOtro}>Hacer otro reporte</button>
      </div>
    </div>
  )
}
