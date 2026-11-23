import { useEffect, useState } from 'react'
import { useEventos } from '../../context/EventosContext'

const GRACIA_MS = 3000 // un corte breve (cambio de red) no merece aviso

// Indicador global del tiempo real (Heurística 1: visibilidad del estado del sistema).
// Si el WebSocket se cae más de 3 s, el vecino lo sabe en cualquier página; al volver, se avisa 2 s.
export default function IndicadorConexion() {
  const { estado } = useEventos()
  const [mostrar, setMostrar] = useState(null) // null | 'caido' | 'recuperado'

  useEffect(() => {
    if (estado === 'reconectando') {
      const t = setTimeout(() => setMostrar('caido'), GRACIA_MS)
      return () => clearTimeout(t)
    }
    if (estado === 'conectado') {
      setMostrar((m) => (m === 'caido' ? 'recuperado' : m))
      const t = setTimeout(() => setMostrar((m) => (m === 'recuperado' ? null : m)), 2000)
      return () => clearTimeout(t)
    }
    return undefined
  }, [estado])

  if (!mostrar) return null
  return (
    <div className={`indicador-conexion indicador-conexion--${mostrar}`} role="status" aria-live="polite">
      <span className={mostrar === 'caido' ? 'punto-vivo punto-vivo--off' : 'punto-vivo'} aria-hidden="true" />
      {mostrar === 'caido'
        ? 'Sin conexión en vivo. Reconectando… (los reportes nuevos aparecerán al volver)'
        : 'Conexión en vivo restablecida'}
    </div>
  )
}
