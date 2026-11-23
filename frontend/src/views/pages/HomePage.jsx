import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { fetchAlertas, fetchDashboard } from '../../services/seguridadService'
import { MESES, formatNumero, formatVariacion } from '../../models/estadisticas'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const MODULOS = [
  { to: '/dashboard', titulo: 'Panel de decisión', texto: 'Indicadores, tendencias, ranking de Lima y matriz de priorización con datos oficiales del SIDPOL.', icono: '📊' },
  { to: '/mapa', titulo: 'Mapa de riesgo', texto: 'Zonas con concentración de reportes, comisarías de la PNP y límite del distrito.', icono: '🗺️' },
  { to: '/reportar', titulo: 'Reportar incidente', texto: 'Informa de forma anónima lo que viste. Tu reporte alimenta el mapa y las alertas.', icono: '📍' },
  { to: '/alertas', titulo: 'Alertas', texto: 'Avisos automáticos por zonas de riesgo, tendencias oficiales y estacionalidad.', icono: '🔔' },
]

// Resumen con los filtros por defecto (Villa El Salvador, últimos 3 años).
const pedirResumen = (signal) => fetchDashboard({}, signal)

export default function HomePage() {
  const resumen = useAsync(pedirResumen, [])
  const alertas = useAsync((signal) => fetchAlertas(signal), [])
  const d = resumen.data

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__tag">Villa El Salvador · Datos abiertos del Estado peruano</span>
          <h1>Información para prevenir, datos para decidir</h1>
          <p>
            Consulta las denuncias policiales oficiales del distrito, identifica zonas de riesgo y reporta incidentes para
            construir una comunidad más segura.
          </p>
          <div className="hero__acciones">
            <Link className="btn btn--alert" to="/reportar">Reportar incidente</Link>
            <Link className="btn btn--claro" to="/dashboard">Ver panel de decisión</Link>
          </div>
        </div>
      </section>

      {d ? (
        <section className="container" aria-label="Resumen">
          <div className="resumen">
          <div className="resumen__item">
            <span className="resumen__valor">{formatNumero(d.kpis.total)}</span>
            <span className="resumen__label">denuncias en {d.periodo}</span>
          </div>
          <div className="resumen__item">
            <span className={`resumen__valor ${d.kpis.variacion > 0 ? 'var--malo' : 'var--bueno'}`}>
              {formatVariacion(d.kpis.variacion)}
            </span>
            <span className="resumen__label">frente al periodo anterior</span>
          </div>
          <div className="resumen__item">
            <span className="resumen__valor">#{d.ranking.posicion}</span>
            <span className="resumen__label">de {d.ranking.de} distritos de Lima</span>
          </div>
          <div className="resumen__item">
            <span className="resumen__valor">{formatNumero(d.kpis.promedioMensual)}</span>
            <span className="resumen__label">denuncias al mes (pico: {MESES[d.kpis.mesPico.mes - 1]} {d.kpis.mesPico.anio})</span>
          </div>
        </div>
        </section>
      ) : null}
      {resumen.error ? <p className="container form-error">{resumen.error}</p> : null}

      <section className="container modulos">
        {MODULOS.map((m) => (
          <Link key={m.to} to={m.to} className="modulo">
            <span className="modulo__icono" aria-hidden="true">{m.icono}</span>
            <h2>{m.titulo}</h2>
            <p>{m.texto}</p>
            <span className="modulo__ir">Abrir →</span>
          </Link>
        ))}
      </section>

      {alertas.data?.length ? (
        <section className="container home-alertas">
          <div className="home-alertas__head">
            <h2>Alertas activas</h2>
            <Link to="/alertas">Ver todas →</Link>
          </div>
          <div className="alertas-grid">
            {alertas.data.slice(0, 3).map((a) => <AlertaCard key={a.id} alerta={a} />)}
          </div>
        </section>
      ) : null}
    </>
  )
}
