// Estado de carga del panel: spinner + esqueleto de KPIs (nunca texto plano).
const KPIS = [0, 1, 2, 3, 4]

export default function SkeletonPanel({ texto = 'Cargando los datos del panel…' }) {
  return (
    <div role="status" className="skeleton-panel">
      <p className="cargando-texto"><span className="spinner" aria-hidden="true" /> {texto}</p>
      <div className="skeleton-kpis" aria-hidden="true">
        {KPIS.map((i) => (
          <div key={i} className="skeleton-card">
            <span className="skeleton skeleton--linea skeleton--corta" />
            <span className="skeleton skeleton--titulo" />
            <span className="skeleton skeleton--linea" />
          </div>
        ))}
      </div>
    </div>
  )
}
