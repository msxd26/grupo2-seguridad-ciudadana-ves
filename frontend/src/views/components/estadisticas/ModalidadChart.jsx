import { formatNumero } from '../../../models/estadisticas'

// Barras horizontales por modalidad (una sola serie; el valor va al final de la barra).
export default function ModalidadChart({ data }) {
  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <ul className="bars" aria-label="Denuncias por modalidad">
      {data.map((d) => (
        <li key={d.modalidad} className="bars__row" title={`${d.modalidad}: ${formatNumero(d.total)} (${d.porcentaje}%)`}>
          <span className="bars__label">{d.modalidad}</span>
          <span className="bars__track">
            {/* Se reserva espacio para el valor al final de la barra más larga */}
            <span className="bars__fill" style={{ width: `calc((100% - 8rem) * ${d.total / max})` }} />
            <span className="bars__value">
              {formatNumero(d.total)} <span className="bars__pct">· {d.porcentaje}%</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
