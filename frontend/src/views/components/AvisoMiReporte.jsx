import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventos } from '../../context/EventosContext'
import { ESTADOS_REPORTE } from '../../models/reportes'
import { etiquetaTipo } from '../../models/tipos'

const DURACION = 12_000

// Aviso privado en tiempo real: el autor se entera al instante cuando moderan su reporte.
export default function AvisoMiReporte() {
  const { suscribir } = useEventos()
  const [aviso, setAviso] = useState(null)

  useEffect(() => suscribir((tipo, datos) => tipo === 'mi-reporte' && setAviso(datos)), [suscribir])

  useEffect(() => {
    if (!aviso) return undefined
    const t = setTimeout(() => setAviso(null), DURACION)
    return () => clearTimeout(t)
  }, [aviso])

  if (!aviso) return null
  const estado = ESTADOS_REPORTE[aviso.estado]

  return (
    <div className={`aviso-mio aviso-mio--${aviso.estado}`} role="status" aria-live="polite">
      <span className="aviso-mio__icono" aria-hidden="true">{estado.icono}</span>
      <div>
        <strong>Tu reporte #{aviso.id} ({etiquetaTipo(aviso.tipo).toLowerCase()}): {estado.label}</strong>
        <span>{aviso.comentarioAdmin ?? estado.descripcion}</span>
      </div>
      <Link to="/mi-cuenta" onClick={() => setAviso(null)}>Ver</Link>
      <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">×</button>
    </div>
  )
}
