import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchAlertas, fetchDashboard, fetchPanelCiudadano } from '../../services/seguridadService'
import { formatNumero } from '../../models/estadisticas'
import { IconoAlerta, IconoCandado, IconoMapa, IconoPanel, IconoPeligro, IconoPin } from '../../models/iconos'
import AlertaCard from '../components/AlertaCard'
import BannerBienvenida from '../components/BannerBienvenida'
import FondoVes from '../components/FondoVes'
import '../../assets/styles/paginas.css'

// Un módulo principal (ancho completo) + 3 secundarios: una acción clara antes que 4 equivalentes (Ley de Hick).
const MODULOS = [
  { to: '/mapa', Icono: IconoMapa, titulo: 'Mapa en tiempo real', texto: 'Incidentes, mapa de calor y puntos seguros.' },
  { to: '/alertas', Icono: IconoAlerta, titulo: 'Alertas', texto: 'Incidentes recientes, zonas de riesgo y tendencias.' },
  { to: '/dashboard', Icono: IconoPanel, titulo: 'Panel municipal', texto: 'Zonas críticas y denuncias oficiales para decidir.' },
]

const ODS = [
  { numero: 5, nombre: 'Igualdad de género', texto: 'canal anónimo para reportar acoso', color: '#C5192D' },
  { numero: 10, nombre: 'Reducción de desigualdades', texto: 'chat IA y modo guiado para todos', color: '#DD1367' },
]

// SUPUESTO EXPLÍCITO (verificar antes del pitch): cifra negra del delito en Lima según INEI (ENAPRES).
// Se usa para estimar cuántos reportes vecinales no habrían llegado a una denuncia formal.
const CIFRA_NEGRA = 0.86

const NIVEL_URGENTE = new Set(['alta', 'media'])
const fechaMs = (a) => (a.fecha ? Date.parse(a.fecha) : 0)

export default function HomePage() {
  const panel = useAsync((signal) => fetchPanelCiudadano({ dias: 7 }, signal), [])
  const oficial = useAsync((signal) => fetchDashboard({}, signal), [])
  const alertas = useAsync((signal) => fetchAlertas(signal), [])
  const { suscribir, conectados } = useEventos()

  // Las cifras y alertas se actualizan cuando llega un reporte nuevo.
  useEffect(
    () => suscribir((evento) => {
      if (!['reporte', 'reporte-moderado', 'reporte-oculto'].includes(evento)) return
      panel.recargar()
      alertas.recargar()
    }),
    [suscribir, panel.recargar, alertas.recargar], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const k = panel.data?.kpis
  // Una sola alerta destacada: la más reciente de nivel alto o medio (figura-fondo).
  const urgente = (alertas.data ?? [])
    .filter((a) => NIVEL_URGENTE.has(a.nivel))
    .toSorted((a, b) => fechaMs(b) - fechaMs(a))[0]
  const noDenunciados = k?.total ? Math.round(k.total * CIFRA_NEGRA) : 0
  const pctAccesible = k?.total ? Math.round((k.accesibles / k.total) * 100) : null
  const posicion = oficial.data?.ranking.posicion

  return (
    <>
      <section className="hero con-fondo-ves">
        <FondoVes />
        <div className="container hero__inner">
          <span className="hero__tag">HackODS UA 2026 · Villa El Salvador</span>
          <h1>Tu vecino/a ya reportó.<br />¿Tú ya revisaste el mapa?</h1>
          <p>
            El 86% de los delitos en Lima nunca llega a una estadística.
            En Villa El Salvador, tus vecinos están cambiando eso.
          </p>
          <p className="hero__anonimo">
            <IconoCandado size={16} aria-hidden="true" /> Sin DNI · Sin registro · 100% anónimo
          </p>
          <div className="hero__acciones">
            <Link className="btn btn--alert btn--grande" to="/reportar">Reportar ahora</Link>
            <Link className="btn btn--claro btn--grande" to="/mapa">Ver el mapa</Link>
          </div>
          {conectados > 0 ? (
            <p className="hero__vivo" aria-live="polite">
              <span className="hero__vivo-punto" aria-hidden="true" />
              {conectados === 1 ? '1 vecino/a revisando el mapa ahora mismo' : `${conectados} vecinos revisando el mapa ahora mismo`}
            </p>
          ) : null}
        </div>
      </section>

      <BannerBienvenida />

      <section className="container ods-pildoras" aria-label="Objetivos de Desarrollo Sostenible que abordamos">
        {ODS.map((o) => (
          <div key={o.numero} className="ods-pildora" style={{ '--ods': o.color }}>
            <span className="ods-pildora__numero">ODS {o.numero}</span>
            <span className="ods-pildora__texto"><strong>{o.nombre}</strong> · {o.texto}</span>
          </div>
        ))}
      </section>

      <section className="container" aria-label="Resumen de la semana">
        <div className="stats">
          <Link to="/mapa" className="stat stat--grande stat--peligro">
            <span className="stat__etiqueta"><IconoPeligro size={18} aria-hidden="true" /> Zonas de alto riesgo ahora</span>
            <span className="stat__valor">{k ? k.zonasCriticas : '—'}</span>
            <span className="stat__cta">Ver en el mapa →</span>
          </Link>
          <div className="stat stat--grande">
            <span className="stat__etiqueta">Reportes esta semana</span>
            <span className="stat__valor">{k ? formatNumero(k.total) : '—'}</span>
            {noDenunciados ? (
              <span className="stat__nota">≈ {formatNumero(noDenunciados)} nunca habrían llegado a una comisaría (estimación)</span>
            ) : null}
          </div>
          <div className="stat">
            <span className="stat__valor">{pctAccesible !== null ? `${pctAccesible}%` : '—'}</span>
            <span className="stat__etiqueta">por chat IA o paso a paso</span>
          </div>
          <div className="stat">
            <span className="stat__valor">{posicion ? `#${posicion}` : '—'}<small> de 43</small></span>
            <span className="stat__etiqueta">distritos de Lima en denuncias (SIDPOL)</span>
          </div>
        </div>
        {panel.data?.hayDemo ? <p className="resumen__nota">Las cifras vecinales incluyen datos de demostración.</p> : null}
      </section>

      {urgente ? (
        <section className="container home-alertas">
          <div className="home-alertas__head">
            <h2>Lo más urgente ahora</h2>
            <Link to="/alertas">Ver todas las alertas →</Link>
          </div>
          <div className="home-alertas__destacada">
            <AlertaCard alerta={urgente} />
          </div>
        </section>
      ) : null}

      <section className="container modulos" aria-label="Qué puedes hacer">
        <Link to="/reportar" className="modulo modulo--principal">
          <span className="modulo__icono" aria-hidden="true"><IconoPin size={30} /></span>
          <div className="modulo__cuerpo">
            <h2>Reportar ahora</h2>
            <p>En menos de 60 segundos y sin DNI: conversando, paso a paso o con formulario.</p>
          </div>
          <span className="modulo__ir" aria-hidden="true">→</span>
        </Link>
        {MODULOS.map(({ to, Icono, titulo, texto }) => (
          <Link key={to} to={to} className="modulo">
            <span className="modulo__icono" aria-hidden="true"><Icono size={26} /></span>
            <h2>{titulo}</h2>
            <p>{texto}</p>
            <span className="modulo__ir">Abrir →</span>
          </Link>
        ))}
      </section>
    </>
  )
}
