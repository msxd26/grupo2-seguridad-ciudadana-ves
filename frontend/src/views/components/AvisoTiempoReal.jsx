import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEventos } from '../../context/EventosContext'
import { tipoDe } from '../../models/tipos'

const DURACION = 9000

// Banner que aparece cuando un vecino envía un reporte (en cualquier página).
export default function AvisoTiempoReal() {
  const { ultimo, descartar } = useEventos()

  useEffect(() => {
    if (!ultimo) return
    const t = setTimeout(descartar, DURACION)
    return () => clearTimeout(t)
  }, [ultimo, descartar])

  if (!ultimo) return null
  const tipo = tipoDe(ultimo.tipo)
  const { Icono } = tipo

  return (
    <div className="aviso-vivo" role="status" aria-live="polite" style={{ '--color-tipo': tipo.color }}>
      <span className="aviso-vivo__icono" aria-hidden="true"><Icono size={20} /></span>
      <div className="aviso-vivo__texto">
        <strong>Nuevo reporte: {tipo.label}</strong>
        <span>{ultimo.referencia ?? 'Villa El Salvador'} · hace un momento</span>
      </div>
      <Link to={`/mapa?lat=${ultimo.lat}&lng=${ultimo.lng}`} onClick={descartar}>Ver en el mapa</Link>
      <button type="button" onClick={descartar} aria-label="Cerrar aviso">×</button>
    </div>
  )
}
