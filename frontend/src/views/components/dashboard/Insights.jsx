const ICONOS = { alerta: '▲', positivo: '✓', info: 'i' }
const ETIQUETAS = { alerta: 'Atención', positivo: 'Mejora', info: 'Dato' }

// Hallazgos generados automáticamente a partir de los datos filtrados.
export default function Insights({ hallazgos }) {
  return (
    <ul className="insights">
      {hallazgos.map((h, i) => (
        <li key={i} className={`insights__item insights__item--${h.tipo}`}>
          <span className="insights__icon" aria-hidden="true">{ICONOS[h.tipo]}</span>
          <p>
            <span className="sr-only">{ETIQUETAS[h.tipo]}: </span>
            {h.texto}
          </p>
        </li>
      ))}
    </ul>
  )
}
