import { useNotificacionesCercanas } from '../../controllers/useNotificacionesCercanas'

// Activar o desactivar las notificaciones del navegador (todas o solo las cercanas).
export default function ControlNotificaciones({ compacto = false }) {
  const n = useNotificacionesCercanas()
  if (!n.soportado) return null

  return (
    <div className={compacto ? 'notif notif--compacto' : 'notif'}>
      {n.activo ? (
        <div className="notif__estado">
          <span aria-hidden="true">🔔</span>
          <span>
            Notificaciones activadas: <strong>{n.modo === 'todas' ? 'todos los reportes' : `a menos de ${n.radio / 1000} km de ti`}</strong>
          </span>
          <button type="button" className="notif__quitar" onClick={n.desactivar}>Desactivar</button>
        </div>
      ) : (
        <div className="notif__opciones" role="group" aria-label="Activar notificaciones del navegador">
          <span className="notif__titulo">🔕 Notificaciones del navegador</span>
          <button type="button" className="notif__boton" onClick={n.activarTodas}>Todos los reportes</button>
          <button type="button" className="notif__boton" onClick={n.activar}>Solo cerca de mí</button>
        </div>
      )}
      {n.error ? <p className="notif__error" role="alert">{n.error}</p> : null}
    </div>
  )
}
