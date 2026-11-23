// Tarjeta de indicador. `delta.malo` indica si la dirección del cambio es desfavorable
// (más denuncias = malo), para colorear con icono + texto y no solo con color.
export default function KpiCard({ label, value, detail, delta }) {
  return (
    <div className="kpi">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      {delta ? (
        <span className={delta.malo ? 'kpi__delta kpi__delta--malo' : 'kpi__delta kpi__delta--bueno'}>
          <span aria-hidden="true">{delta.sube ? '▲' : '▼'}</span> {delta.texto}
        </span>
      ) : null}
      {detail ? <span className="kpi__detail">{detail}</span> : null}
    </div>
  )
}
