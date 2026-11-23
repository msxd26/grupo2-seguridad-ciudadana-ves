import { useState } from 'react'
import { TIPOS } from '../../../models/tipos'

// Dos grupos: lo peligroso primero, lo informativo después (jerarquía visual).
const PELIGRO = new Set(['robo', 'intento_robo', 'acoso'])
const GRUPOS = [
  { id: 'peligro', titulo: 'Incidentes (peligro)', tipos: TIPOS.filter((t) => PELIGRO.has(t.id)) },
  { id: 'otros', titulo: 'Otros', tipos: TIPOS.filter((t) => !PELIGRO.has(t.id)) },
]

// Leyenda flotante sobre el mapa: cada color va con su ícono y su nombre (WCAG 1.4.1: nunca solo color).
// Plegada por defecto: es referencia, no siempre hace falta.
export default function LeyendaMapa() {
  const [abierta, setAbierta] = useState(false)
  return (
    <div className={abierta ? 'leyenda-mapa' : 'leyenda-mapa leyenda-mapa--cerrada'}>
      <button type="button" className="leyenda-mapa__titulo" aria-expanded={abierta} aria-controls="leyenda-mapa-lista" onClick={() => setAbierta((a) => !a)}>
        Leyenda <span aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>
      {abierta ? (
        <div id="leyenda-mapa-lista">
          {GRUPOS.map((g) => (
            <div key={g.id} className={`leyenda-mapa__grupo leyenda-mapa__grupo--${g.id}`}>
              <span className="leyenda-mapa__subtitulo">{g.titulo}</span>
              <ul className="leyenda-mapa__lista">
                {g.tipos.map(({ id, label, color, Icono }) => (
                  <li key={id}>
                    <span className="leyenda-mapa__icono" style={{ '--color-tipo': color }} aria-hidden="true"><Icono size={14} /></span>
                    {label}
                  </li>
                ))}
                {g.id === 'otros' ? <li><i className="leyenda__seguro" aria-hidden="true" /> Punto seguro (comisaría)</li> : null}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
