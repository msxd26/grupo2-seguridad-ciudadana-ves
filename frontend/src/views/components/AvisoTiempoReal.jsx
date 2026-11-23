import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventos } from '../../context/EventosContext'
import { tipoDe } from '../../models/tipos'

const DURACION = 8000
const MAXIMO = 3 // avisos visibles a la vez; los más antiguos se van primero

// Avisos en pantalla cuando un vecino reporta algo (en cualquier página).
// Se apilan: si llegan varios seguidos (p. ej. una ráfaga de alertas) se ven todos.
export default function AvisoTiempoReal() {
  const { suscribir } = useEventos()
  const [avisos, setAvisos] = useState([])
  const temporizadores = useRef(new Map())

  const quitar = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id))
    temporizadores.current.delete(id)
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  useEffect(
    () =>
      suscribir((tipo, reporte) => {
        if (tipo !== 'reporte') return
        setAvisos((lista) => [reporte, ...lista.filter((a) => a.id !== reporte.id)].slice(0, MAXIMO))
        temporizadores.current.set(reporte.id, setTimeout(() => quitar(reporte.id), DURACION))
      }),
    [suscribir, quitar],
  )

  useEffect(() => {
    const t = temporizadores.current
    return () => t.forEach(clearTimeout)
  }, [])

  if (!avisos.length) return null

  return (
    <div className="avisos-vivo" role="status" aria-live="polite">
      {avisos.map((r) => {
        const tipo = tipoDe(r.tipo)
        const { Icono } = tipo
        return (
          <div key={r.id} className="aviso-vivo" style={{ '--color-tipo': tipo.color }}>
            <span className="aviso-vivo__icono" aria-hidden="true"><Icono size={20} /></span>
            <div className="aviso-vivo__texto">
              <strong>Nuevo reporte: {tipo.label}{r.esDemo ? <span className="badge-demo">DEMO</span> : null}</strong>
              <span>{r.referencia ?? 'Villa El Salvador'} · hace un momento</span>
            </div>
            <Link to={`/mapa?lat=${r.lat}&lng=${r.lng}`} onClick={() => quitar(r.id)}>Ver en el mapa</Link>
            <button type="button" onClick={() => quitar(r.id)} aria-label="Cerrar aviso">×</button>
          </div>
        )
      })}
    </div>
  )
}
