import { PRIORIDADES, formatNumero, formatVariacion } from '../../../models/estadisticas'

const ORDEN = { alta: 0, media: 1, baja: 2 }

// Matriz de priorización: volumen + participación + variación → prioridad sugerida.
export default function PriorityTable({ modalidades, hayPrevio, onSelect, seleccionadas }) {
  const filas = modalidades
    .filter((m) => m.prioridad)
    .toSorted((a, b) => ORDEN[a.prioridad] - ORDEN[b.prioridad] || b.total - a.total)

  return (
    <div className="priority">
      <table>
        <thead>
          <tr>
            <th scope="col">Modalidad</th>
            <th scope="col" className="num">Denuncias</th>
            <th scope="col" className="num">% del total</th>
            <th scope="col" className="num">Variación</th>
            <th scope="col">Prioridad</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((m) => {
            const p = PRIORIDADES[m.prioridad]
            return (
              <tr key={m.id} className={seleccionadas.includes(m.id) ? 'priority__row--activa' : undefined}>
                <th scope="row">
                  <button type="button" className="priority__link" onClick={() => onSelect(m.id)}>{m.modalidad}</button>
                </th>
                <td className="num">{formatNumero(m.total)}</td>
                <td className="num">{m.participacion}%</td>
                <td className={`num ${m.variacion > 0 ? 'var--malo' : m.variacion < 0 ? 'var--bueno' : ''}`}>
                  {hayPrevio ? formatVariacion(m.variacion) : '—'}
                </td>
                <td>
                  <span className={`badge badge--${m.prioridad}`}>
                    <span aria-hidden="true">{p.icono}</span> {p.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="priority__nota">
        <strong>Alta:</strong> participación ≥ 15% y en aumento, o crecimiento ≥ 20% con 100+ casos. <strong>Media:</strong>{' '}
        en aumento o participación ≥ 15%. <strong>Baja:</strong> estable o en descenso. “Otros” se excluye.
      </p>
    </div>
  )
}
