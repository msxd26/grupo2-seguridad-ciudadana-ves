import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchAlertas } from '../../services/seguridadService'
import { distanciaMetros } from '../../models/tipos'
import { IconoInfo } from '../../models/iconos'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const RADIO_MI_ZONA = 1500 // metros
const EVENTOS_RECARGA = new Set(['reporte', 'reporte-moderado', 'reporte-oculto'])

const FILTROS = [
  { id: 'todas', label: 'Todas', cumple: () => true },
  { id: 'mi-zona', label: 'Mi zona', cumple: (a) => a.distancia !== undefined && a.distancia <= RADIO_MI_ZONA },
  { id: 'peligro', label: 'Peligro alto', cumple: (a) => a.nivel === 'alta' },
  { id: 'analisis', label: 'Zonas y análisis', cumple: (a) => a.tipo !== 'incidente' },
]

// Las alertas se agrupan por naturaleza: lo que pasó ahora primero, el análisis después (Ley de Jakob).
const GRUPOS = [
  { id: 'incidentes', titulo: 'Incidentes recientes', sub: 'Reportados por vecinos en las últimas 24 horas', tipos: ['incidente'] },
  { id: 'zonas', titulo: 'Zonas de riesgo', sub: 'Lugares con varios reportes en los últimos 7 días', tipos: ['zona'] },
  { id: 'analisis', titulo: 'Tendencias y análisis', sub: 'Calculado con las denuncias oficiales (SIDPOL)', tipos: ['tendencia', 'estacional'] },
]

function SkeletonAlertas() {
  return (
    <div className="alertas-grid" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-card">
          <span className="skeleton skeleton--chip" />
          <span className="skeleton skeleton--titulo" />
          <span className="skeleton skeleton--linea" />
          <span className="skeleton skeleton--linea skeleton--corta" />
        </div>
      ))}
    </div>
  )
}

export default function AlertasPage() {
  const [filtro, setFiltro] = useState('todas')
  const [posicion, setPosicion] = useState(null)
  const [errorGps, setErrorGps] = useState(null)
  const { data, error, cargando, recargar } = useAsync((signal) => fetchAlertas(signal), [])
  const { suscribir } = useEventos()

  // Un nuevo reporte genera una nueva alerta: se recarga el feed.
  useEffect(() => suscribir((evento) => EVENTOS_RECARGA.has(evento) && recargar()), [suscribir, recargar])

  const elegir = (id) => {
    setFiltro(id)
    if (id === 'mi-zona' && !posicion) {
      if (!navigator.geolocation) return setErrorGps('Tu navegador no permite obtener la ubicación.')
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => { setPosicion({ lat: coords.latitude, lng: coords.longitude }); setErrorGps(null) },
        () => setErrorGps('No pudimos obtener tu ubicación. Activa el permiso de ubicación para ver tu zona.'),
        { timeout: 10_000 },
      )
    }
  }

  const conDistancia = (data ?? []).map((a) =>
    posicion && a.lat ? { ...a, distancia: distanciaMetros(posicion.lat, posicion.lng, a.lat, a.lng) } : a,
  )
  const filtroActual = FILTROS.find((f) => f.id === filtro)
  const alertas = conDistancia.filter(filtroActual.cumple)
  if (filtro === 'mi-zona') alertas.sort((a, b) => a.distancia - b.distancia)

  // Contador por filtro (feedback inmediato de cuánto hay). "Mi zona" solo cuenta con ubicación.
  const contar = (f) => (f.id === 'mi-zona' && !posicion ? null : conDistancia.filter(f.cumple).length)
  const grupos = GRUPOS.map((g) => ({ ...g, items: alertas.filter((a) => g.tipos.includes(a.tipo)) })).filter((g) => g.items.length)

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Alertas comunitarias</h1>
        <p>Incidentes de tus vecinos, zonas de riesgo y tendencias de las denuncias oficiales.</p>
      </header>

      <div className="segmented--claro" role="group" aria-label="Filtrar alertas">
        {FILTROS.map((f) => {
          const n = data ? contar(f) : null
          return (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} className={filtro === f.id ? 'activo' : undefined} onClick={() => elegir(f.id)}>
              {f.label}{n !== null ? <span className="filtro__contador"> ({n})</span> : null}
            </button>
          )
        })}
      </div>

      <details className="como-funciona">
        <summary><IconoInfo size={18} aria-hidden="true" /> ¿Cómo se generan estas alertas?</summary>
        <ul>
          <li><strong>Reportes vecinales:</strong> cada incidente reportado en las últimas 24 horas aparece aquí al instante.</li>
          <li><strong>Zonas de riesgo:</strong> 3 o más reportes en la misma zona (~330 m) durante 7 días. Con 5 o más, el nivel es de peligro.</li>
          <li><strong>Tendencias oficiales:</strong> modalidades que crecen 10% o más en los últimos 3 meses de denuncias SIDPOL (mínimo 30).</li>
          <li><strong>Estacionales:</strong> el mes siguiente suele registrar más denuncias que un mes típico.</li>
        </ul>
      </details>

      {errorGps && filtro === 'mi-zona' ? <div className="form-error" role="alert">{errorGps}</div> : null}
      {filtro === 'mi-zona' && posicion ? <p className="pagina__nota">Mostrando alertas a menos de {RADIO_MI_ZONA / 1000} km de tu ubicación.</p> : null}
      {error ? <div className="form-error" role="alert">No se pudieron cargar las alertas: {error}</div> : null}
      {cargando && !data ? (
        <div role="status">
          <p className="cargando-texto"><span className="spinner" aria-hidden="true" /> Buscando lo más reciente…</p>
          <SkeletonAlertas />
        </div>
      ) : null}

      {data ? (
        grupos.length ? (
          grupos.map((g) => (
            <section key={g.id} className="alertas-grupo" aria-labelledby={`grupo-${g.id}`}>
              <header className="alertas-grupo__head">
                <h2 id={`grupo-${g.id}`}>{g.titulo} <span className="alertas-grupo__n">{g.items.length}</span></h2>
                <p>{g.sub}</p>
              </header>
              <div className="alertas-grid">
                {g.items.map((a) => <AlertaCard key={a.id} alerta={a} distancia={a.distancia} />)}
              </div>
            </section>
          ))
        ) : (
          <p className="vacio">
            {filtro === 'mi-zona' && !posicion
              ? 'Esperando tu ubicación…'
              : <>Sin alertas de este tipo. ¡Eso es buena señal! Si ves algo, <Link to="/reportar">repórtalo</Link>.</>}
          </p>
        )
      ) : null}

      <aside className="cta-reportar">
        <p><strong>¿Viste algo?</strong> Reportarlo toma 60 segundos y es anónimo.</p>
        <Link className="btn btn--primario" to="/reportar">Reportar ahora</Link>
      </aside>
    </section>
  )
}
