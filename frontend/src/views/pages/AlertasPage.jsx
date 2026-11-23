import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { fetchAlertas } from '../../services/seguridadService'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const FILTROS = [
  { id: '', label: 'Todas' },
  { id: 'zona', label: 'Zonas de riesgo' },
  { id: 'tendencia', label: 'Tendencias oficiales' },
  { id: 'estacional', label: 'Estacionales' },
]

export default function AlertasPage() {
  const [filtro, setFiltro] = useState('')
  const { data, error, cargando } = useAsync((signal) => fetchAlertas(signal), [])
  const alertas = (data ?? []).filter((a) => !filtro || a.tipo === filtro)

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Alertas</h1>
        <p>Alertas generadas automáticamente a partir de los reportes ciudadanos y de las denuncias oficiales del SIDPOL.</p>
      </header>

      <div className="segmented segmented--claro" role="group" aria-label="Filtrar alertas">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filtro === f.id} className={filtro === f.id ? 'activo' : undefined} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {error ? <div className="form-error" role="alert">No se pudieron cargar las alertas: {error}</div> : null}
      {cargando && !data ? <p>Cargando alertas…</p> : null}

      {data ? (
        alertas.length ? (
          <div className="alertas-grid">
            {alertas.map((a) => <AlertaCard key={a.id} alerta={a} />)}
          </div>
        ) : (
          <p className="vacio">No hay alertas activas de este tipo.</p>
        )
      ) : null}

      <section className="como-funciona">
        <h2>¿Cómo se generan?</h2>
        <ul>
          <li><strong>Zonas de riesgo:</strong> 3 o más reportes ciudadanos en la misma zona (~330 m) durante los últimos 7 días. Con 5 o más, la alerta es alta.</li>
          <li><strong>Tendencias oficiales:</strong> modalidades que crecen 10% o más en los últimos 3 meses publicados frente a los mismos meses del año anterior (mínimo 30 denuncias).</li>
          <li><strong>Estacionales:</strong> el mes siguiente registra históricamente más denuncias que un mes típico.</li>
        </ul>
        <p>¿Viste algo? <Link to="/reportar">Repórtalo aquí</Link>.</p>
      </section>
    </section>
  )
}
