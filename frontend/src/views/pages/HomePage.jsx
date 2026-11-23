import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchAlertas, fetchDashboard, fetchPanelCiudadano } from '../../services/seguridadService'
import { formatNumero } from '../../models/estadisticas'
import { IconoAlerta, IconoChat, IconoGuiado, IconoMapa, IconoPanel } from '../../models/iconos'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const MODULOS = [
  { to: '/mapa', Icono: IconoMapa, titulo: 'Mapa en tiempo real', texto: 'Incidentes, mapa de calor y puntos seguros de Villa El Salvador.' },
  { to: '/reportar/chat', Icono: IconoChat, titulo: 'Reporta conversando', texto: 'Escribe o dicta lo que pasó; la IA arma el reporte por ti.' },
  { to: '/reportar/guiado', Icono: IconoGuiado, titulo: 'Paso a paso', texto: 'Botones grandes y una pregunta a la vez. Ideal para adultos mayores.' },
  { to: '/dashboard', Icono: IconoPanel, titulo: 'Panel municipal', texto: 'Zonas críticas, tendencias y denuncias oficiales para decidir.' },
]

const ODS = [
  { numero: 5, nombre: 'Igualdad de género', texto: 'Canal anónimo y seguro para reportar acoso y violencia.', color: '#FF3A21' },
  { numero: 10, nombre: 'Reducción de desigualdades', texto: 'Chat IA y modo guiado para quienes tienen poca experiencia digital.', color: '#DD1367' },
]

export default function HomePage() {
  const panel = useAsync((signal) => fetchPanelCiudadano({ dias: 7 }, signal), [])
  const oficial = useAsync((signal) => fetchDashboard({}, signal), [])
  const alertas = useAsync((signal) => fetchAlertas(signal), [])
  const { suscribir } = useEventos()

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
  const incidentes = (alertas.data ?? []).filter((a) => a.tipo === 'incidente').slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__tag">HackODS UA 2026 · Villa El Salvador</span>
          <h1>Tu vecino/a ya reportó.<br />¿Tú ya revisaste el mapa?</h1>
          <p>
            Haciendo visible la inseguridad que no se denuncia. Reporta en menos de 60 segundos, sin registrarte, y
            ayuda a que Villa El Salvador sea más segura.
          </p>
          <div className="hero__acciones">
            <Link className="btn btn--alert btn--grande" to="/reportar">Reportar un incidente</Link>
            <Link className="btn btn--claro btn--grande" to="/mapa">Ver el mapa</Link>
          </div>
        </div>
      </section>

      <section className="container" aria-label="Resumen">
        <div className="resumen">
          <div className="resumen__item">
            <span className="resumen__valor">{k ? formatNumero(k.total) : '—'}</span>
            <span className="resumen__label">reportes vecinales esta semana</span>
          </div>
          <div className="resumen__item">
            <span className="resumen__valor resumen__valor--rojo">{k ? k.zonasCriticas : '—'}</span>
            <span className="resumen__label">zonas críticas detectadas</span>
          </div>
          <div className="resumen__item">
            <span className="resumen__valor">{k?.total ? `${Math.round((k.accesibles / k.total) * 100)}%` : '—'}</span>
            <span className="resumen__label">reportes hechos por chat IA o paso a paso</span>
          </div>
          <div className="resumen__item">
            <span className="resumen__valor">{oficial.data?.ranking.posicion ? `#${oficial.data.ranking.posicion}` : '—'}</span>
            <span className="resumen__label">de 43 distritos de Lima en denuncias oficiales (SIDPOL)</span>
          </div>
        </div>
        {panel.data?.hayDemo ? <p className="resumen__nota">Las cifras vecinales incluyen datos de demostración.</p> : null}
      </section>

      {incidentes.length ? (
        <section className="container home-alertas">
          <div className="home-alertas__head">
            <h2><IconoAlerta size={22} aria-hidden="true" style={{ verticalAlign: '-4px', marginRight: 6 }} />Alertas recientes</h2>
            <Link to="/alertas">Ver todas →</Link>
          </div>
          <div className="alertas-grid">
            {incidentes.map((a) => <AlertaCard key={a.id} alerta={a} />)}
          </div>
        </section>
      ) : null}

      <section className="container modulos">
        {MODULOS.map(({ to, Icono, titulo, texto }) => (
          <Link key={to} to={to} className="modulo">
            <span className="modulo__icono" aria-hidden="true"><Icono size={26} /></span>
            <h2>{titulo}</h2>
            <p>{texto}</p>
            <span className="modulo__ir">Abrir →</span>
          </Link>
        ))}
      </section>

      <section className="container ods" aria-labelledby="ods-titulo">
        <h2 id="ods-titulo">Objetivos de Desarrollo Sostenible que abordamos</h2>
        <div className="ods__grid">
          {ODS.map((o) => (
            <div key={o.numero} className="ods__item" style={{ '--ods': o.color }}>
              <span className="ods__numero">ODS {o.numero}</span>
              <strong>{o.nombre}</strong>
              <p>{o.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
