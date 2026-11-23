export default function StatTile({ label, value, detail, delta }) {
  return (
    <div className="stat-tile">
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value">{value}</span>
      {delta ? (
        <span className={delta.sube ? 'stat-tile__delta stat-tile__delta--up' : 'stat-tile__delta stat-tile__delta--down'}>
          <span aria-hidden="true">{delta.sube ? '▲' : '▼'}</span> {delta.texto}
        </span>
      ) : null}
      {detail ? <span className="stat-tile__detail">{detail}</span> : null}
    </div>
  )
}
