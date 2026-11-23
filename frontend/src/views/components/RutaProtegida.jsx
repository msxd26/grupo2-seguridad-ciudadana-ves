import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const verificando = <p className="page-loading container">Verificando sesión…</p>

// Exige sesión (y opcionalmente un rol). Si no hay sesión, envía a /ingresar y luego regresa.
export default function RutaProtegida({ rol, children }) {
  const { usuario, verificando: cargando } = useAuth()
  const location = useLocation()

  if (cargando) return verificando
  if (!usuario) {
    const volver = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/ingresar?volver=${volver}`} replace />
  }
  if (rol && usuario.rol !== rol) return <Navigate to="/mi-cuenta" replace />
  return children
}
