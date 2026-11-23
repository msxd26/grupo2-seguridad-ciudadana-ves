import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchAlertas } from '../../services/seguridadService'
import { distanciaMetros } from '../../models/tipos'
import { IconoAlerta, IconoInfo, IconoPeligro, IconoAtencion } from '../../models/iconos'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const RADIO_MI_ZONA = 1500 // metros
const EVENTOS_RECARGA = new Set(['reporte', 'reporte-moderado', 'reporte-oculto'])

const FILTROS = [
  { id: 'todas',    label: 'Todas',          cumple: () => true },
  { id: 'mi-zona', label: 'Mi zona',         cumple: (a) => a.distancia !== undefined && a.distancia <= RADIO_MI_ZONA },
  { id: 'peligro', label: 'Peligro alto',    cumple: (a) => a.nivel === 'alta' },
  { id: 'analisis',label: 'Zonas y análisis',cumple: (a) => a.tipo !== 'incidente' },
]

// Las alertas se agrupan por naturaleza: lo que pasó ahora primero, el análisis después.
// Principio: Ley de Jakob — el usuario espera ver lo más urgente/reciente primero.
const GRUPOS = [
  { id: 'incidentes', titulo: 'Incidentes recientes', sub: 'Reportados por vecinos en las últimas 24 horas', tipos: ['incidente'] },
  { id: 'zonas',      titulo: 'Zonas de riesgo',       sub: 'Lugares con varios reportes en los últimos 7 días', tipos: ['zona'] },
  { id: 'analisis',   titulo: 'Tendencias y análisis', sub: 'Calculado con las denuncias oficiales (SIDPOL)', tipos: ['tendencia', 'estacional'] },
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

// Chips de resumen al tope: orienta al usuario antes de la lista.
// Principio: Pareto — el 80% necesita solo saber si hay algo urgente.
function ResumenChips({ alertas }) {
  const incidentes = alertas.filter((a) => a.tipo === 'incidente').length
  const zonas = alertas.filter((a) => a.tipo === 'zona').length
  const analisis = alertas.filter((a) => a.tipo === 'tendencia' || a.tipo === 'estacional').length
  const peligro = alertas.filter((a) => a.nivel === 'alta').length

  if (!alertas.length) return null
  return (
    <div className="alertas-resumen" aria-label="Resumen de alertas activas" role="region">
      {peligro > 0 ? (
        <span className="alertas-chip alertas-chip--peligro">
          <IconoPeligro size={15} aria-hidden="true" />
          {peligro} peligro alto
        </span>
      ) : null}
      {incidentes > 0 ? (
        <span className="alertas-chip alertas-chip--incidente">
          <IconoAlerta size={15} aria-hidden="true" />
          {incidentes} incidente{incidentes > 1 ? 's' : ''} hoy
        </span>
      ) : null}
      {zonas > 0 ? (
        <span className="alertas-chip alertas-chip--zona">
          <IconoAtencion size={15} aria-hidden="true" />
          {zonas} zona{zonas > 1 ? 's' : ''} crítica{zonas > 1 ? 's' : ''}
        </span>
      ) : null}
      {analisis > 0 ? (
        <span className="alertas-chip alertas-chip--analisis">
          <IconoInfo size={15} aria-hidden="true" />
          {analisis} análisis oficial{analisis > 1 ? 'es' : ''}
        </span>
      ) : null}
    </div>
  )
}

// Estado vacío con CTA — no solo texto plano.
// Principio: Nielsen #1 (visibilidad del estado del sistema), ODS 10.
function Vacio({ filtro, esperandoGps }) {
  if (filtro === 'mi-zona' && esperandoGps) {
    return (
      <div className="vacio-estado">
        <span className="spinner" aria-label="Obteniendo tu ubicación…" style={{ width: 24, height: 24, borderWidth: 3 }} />
        <p>Obteniendo tu ubicación…</p>
      </div>
    )
  }
  return (
    <div className="vacio-estado">
      <span className="vacio-estado__icono" aria-hidden="true">✅</span>
      <p>
        {filtro === 'mi-zona'
          ? 'No hay alertas cerca de ti. ¡Todo tranquilo en tu zona!'
          : 'No hay alertas de este tipo ahora mismo. ¡Buena señal!'}
      </p>
      <Link className="btn btn--primario" to="/reportar">
        ¿Ves algo? Repórtalo
      </Link>
    </div>
  )
}

export default function AlertasPage() {
  const [filtro, setFiltro] = useState('todas')
  const [posicion, setPosicion] = useState(null)
  const [esperandoGps, setEsperandoGps] = useState(false)
  const [errorGps, setErrorGps] = useState(null)
  const { data, error, cargando, recargar } = useAsync((signal) => fetchAlertas(signal), [])
  const { suscribir } = useEventos()

  // Un nuevo reporte genera una nueva alerta: se recarga el feed.
  useEffect(() => suscribir((evento) => EVENTOS_RECARGA.has(evento) && recargar()), [suscribir, recargar])

  const elegir = (id) => {
    setFiltro(id)
    if (id === 'mi-zona' && !posicion) {
      if (!navigator.geolocation) return setErrorGps('Tu navegador no permite obtener la ubicación.')
      setEsperandoGps(true)
      setErrorGps(null)
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosicion({ lat: coords.latitude, lng: coords.longitude })
          setErrorGps(null)
          setEsperandoGps(false)
        },
        () => {
          setErrorGps('No pudimos obtener tu ubicación. Activa el permiso de ubicación para ver tu zona.')
          setEsperandoGps(false)
        },
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

  // Contador por filtro para feedback inmediato.
  // "Mi zona" solo cuenta cuando hay ubicación (Principio de Miller: no confundir con ceros engañosos).
  const contar = (f) => (f.id === 'mi-zona' && !posicion ? null : conDistancia.filter(f.cumple).length)
  const grupos = GRUPOS.map((g) => ({ ...g, items: alertas.filter((a) => g.tipos.includes(a.tipo)) })).filter((g) => g.items.length)

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Alertas comunitarias</h1>
        <p>Incidentes de tus vecinos, zonas de riesgo y tendencias de las denuncias oficiales.</p>
      </header>

      {/* Resumen en chips: orienta antes de la lista (Pareto) */}
      {data ? <ResumenChips alertas={conDistancia} /> : null}

      {/* Filtros: min-height 44px táctil (WCAG 2.5.5, ODS 10) */}
      <div className="segmented--claro alertas-filtros" role="group" aria-label="Filtrar alertas">
        {FILTROS.map((f) => {
          const n = data ? contar(f) : null
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              className={filtro === f.id ? 'activo' : undefined}
              onClick={() => elegir(f.id)}
            >
              {f.label}
              {n !== null ? <span className="filtro__contador"> ({n})</span> : null}
              {f.id === 'mi-zona' && esperandoGps ? (
                <span className="spinner spinner--mini" aria-label="Obteniendo ubicación" />
              ) : null}
            </button>
          )
        })}
      </div>

      {errorGps && filtro === 'mi-zona' ? <div className="form-error" role="alert">{errorGps}</div> : null}
      {filtro === 'mi-zona' && posicion ? (
        <p className="pagina__nota">Mostrando alertas a menos de {RADIO_MI_ZONA / 1000} km de tu ubicación.</p>
      ) : null}
      {error ? (
        <div className="form-error" role="alert">
          No se pudieron cargar las alertas: {error}
          <button type="button" className="alerta__accion" onClick={recargar} style={{ marginLeft: '0.75rem' }}>
            Reintentar
          </button>
        </div>
      ) : null}

      {/* Carga: spinner + skeletons (nunca texto plano solo) */}
      {cargando && !data ? (
        <div role="status">
          <p className="cargando-texto"><span className="spinner" aria-hidden="true" /> Buscando lo más reciente…</p>
          <SkeletonAlertas />
        </div>
      ) : null}

      {/* Lista agrupada */}
      {data ? (
        grupos.length ? (
          <div role="feed" aria-label="Alertas comunitarias" aria-busy={cargando}>
            {grupos.map((g) => (
              <section key={g.id} className="alertas-grupo" aria-labelledby={`grupo-${g.id}`}>
                <header className="alertas-grupo__head">
                  <h2 id={`grupo-${g.id}`}>
                    {g.titulo} <span className="alertas-grupo__n">{g.items.length}</span>
                  </h2>
                  <p>{g.sub}</p>
                </header>
                <div className="alertas-grid">
                  {g.items.map((a) => <AlertaCard key={a.id} alerta={a} distancia={a.distancia} />)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <Vacio filtro={filtro} esperandoGps={esperandoGps && !posicion} />
        )
      ) : null}

      {/* CTA antes del acordeón: visible sin escrollar en móvil */}
      {data ? (
        <aside className="cta-reportar">
          <p><strong>¿Viste algo?</strong> Reportarlo toma 60 segundos y es anónimo.</p>
          <Link className="btn btn--primario" to="/reportar">Reportar ahora</Link>
        </aside>
      ) : null}

      {/* "¿Cómo funciona?" al final: texto de apoyo, no de contenido principal
          Principio: Ley de Jakob — se espera al pie, no bloqueando el feed */}
      <details className="como-funciona">
        <summary><IconoInfo size={18} aria-hidden="true" /> ¿Cómo se generan estas alertas?</summary>
        <ul>
          <li><strong>Reportes vecinales:</strong> cada incidente reportado en las últimas 24 horas aparece aquí al instante.</li>
          <li><strong>Zonas de riesgo:</strong> 3 o más reportes en la misma zona (~330 m) durante 7 días. Con 5 o más, el nivel es de peligro.</li>
          <li><strong>Tendencias oficiales:</strong> modalidades que crecen 10% o más en los últimos 3 meses de denuncias SIDPOL (mínimo 30).</li>
          <li><strong>Estacionales:</strong> el mes siguiente suele registrar más denuncias que un mes típico.</li>
        </ul>
      </details>
    </section>
  )
}
