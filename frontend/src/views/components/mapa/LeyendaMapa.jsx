import { useState } from 'react'
import { TIPOS } from '../../../models/tipos'

const esCelular = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

// Leyenda flotante sobre el mapa: cada color va con su ícono y su nombre (WCAG 1.4.1: nunca solo color).
// Abierta en escritorio, plegada en celulares para no tapar el mapa.
export default function LeyendaMapa() {
  const [abierta, setAbierta] = useState(() => !esCelular())
  return (
    <div className={abierta ? 'leyenda-mapa' : 'leyenda-mapa leyenda-mapa--cerrada'}>
      <button type="button" className="leyenda-mapa__titulo" aria-expanded={abierta} aria-controls="leyenda-mapa-lista" onClick={() => setAbierta((a) => !a)}>
        Leyenda <span aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>
      {abierta ? (
        <ul id="leyenda-mapa-lista" className="leyenda-mapa__lista">
          {TIPOS.map(({ id, label, color, Icono }) => (
            <li key={id}>
              <span className="leyenda-mapa__icono" style={{ '--color-tipo': color }} aria-hidden="true"><Icono size={14} /></span>
              {label}
            </li>
          ))}
          <li><i className="leyenda__seguro" aria-hidden="true" /> Punto seguro (comisaría)</li>
        </ul>
      ) : null}
    </div>
  )
}
