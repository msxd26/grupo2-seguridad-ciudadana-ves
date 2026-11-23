import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../controllers/useAsync'
import { fetchMisReportes } from '../../services/cuentaService'
import { fetchAlertas } from '../../services/seguridadService'
import { CONSEJOS, ESTADOS_REPORTE, ICONOS_TIPO, PASOS, pasoActual, saludo } from '../../models/reportes'
import { EMERGENCY_NUMBERS } from '../../models/navigation'
import '../../assets/styles/cuenta.css'

const fecha = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const ACCIONES = [
  { to: '/reportar', icono: '📍', titulo: 'Reportar algo', texto: 'Cuéntanos qué viste', color: 'coral' },
  { to: '/mapa', icono: '🗺️', titulo: 'Ver el mapa', texto: 'Zonas de tu barrio', color: 'teal' },
  { to: '/alertas', icono: '🔔', titulo: 'Alertas', texto: 'Qué está pasando', color: 'amber' },
  { to: '/contacto', icono: '☎️', titulo: 'Emergencias', texto: 'Números útiles', color: 'violet' },
]

function TarjetaReporte({ reporte }) {
  const estado = ESTADOS_REPORTE[reporte.estado]
  const paso = pasoActual(reporte.estado)
  return (
    <article className={`mi-reporte mi-reporte--${reporte.estado}`}>
      <div className="mi-reporte__cabecera">
        <span className="mi-reporte__icono" aria-hidden="true">{ICONOS_TIPO[reporte.tipo] ?? '📌'}</span>
        <div>
          <h3>{reporte.tipo}</h3>
          <span className="mi-reporte__fecha">Reporte #{reporte.id} · {fecha.format(new Date(reporte.creadoEn))}</span>
        </div>
        <span className={`estado-pill estado-pill--${reporte.estado}`}>
          <span aria-hidden="true">{estado.icono}</span> {estado.label}
        </span>
      </div>

      <p className="mi-reporte__desc">{reporte.descripcion}</p>

      <ol className="pasos" aria-label="Progreso del reporte">
        {PASOS.map((p, i) => (
          <li key={p} className={i <= paso ? 'pasos__item pasos__item--hecho' : 'pasos__item'}>
            <span className="pasos__punto" aria-hidden="true" />
            {i === 2 && reporte.estado === 'descartado' ? 'Cerrado' : p}
          </li>
        ))}
      </ol>

      {reporte.comentarioAdmin ? (
        <div className="burbuja">
          <span className="burbuja__autor">Respuesta del equipo</span>
          {reporte.comentarioAdmin}
        </div>
      ) : (
        <p className="mi-reporte__estado-texto">{estado.descripcion}</p>
      )}

      <Link className="mi-reporte__mapa" to={`/mapa?lat=${reporte.lat}&lng=${reporte.lng}`}>Ver en el mapa →</Link>
    </article>
  )
}

export default function MiCuentaPage() {
  const { usuario } = useAuth()
  const reportes = useAsync((signal) => fetchMisReportes(signal), [])
  const alertas = useAsync((signal) => fetchAlertas(signal), [])
  const [consejo, setConsejo] = useState(() => Math.floor(Math.random() * CONSEJOS.length))

  const lista = reportes.data ?? []
  const verificados = lista.filter((r) => r.estado === 'verificado').length
  const enRevision = lista.filter((r) => r.estado === 'pendiente').length
  const s = saludo()
  const c = CONSEJOS[consejo]
  const primerNombre = usuario.nombre.split(' ')[0]

  return (
    <div className="cuenta">
      <section className="cuenta__hero">
        <div className="container cuenta__hero-inner">
          <div>
            <p className="cuenta__saludo">{s.texto} <span aria-hidden="true">{s.icono}</span></p>
            <h1>¡Hola, {primerNombre}!</h1>
            <p className="cuenta__sub">Gracias por ayudar a cuidar Villa El Salvador.</p>
          </div>
          <div className="contadores">
            <div className="contador"><strong>{lista.length}</strong><span>reportes enviados</span></div>
            <div className="contador"><strong>{verificados}</strong><span>verificados</span></div>
            <div className="contador"><strong>{enRevision}</strong><span>en revisión</span></div>
          </div>
        </div>
      </section>

      <div className="container cuenta__cuerpo">
        <nav className="acciones" aria-label="Accesos rápidos">
          {ACCIONES.map((a) => (
            <Link key={a.to} to={a.to} className={`accion accion--${a.color}`}>
              <span className="accion__icono" aria-hidden="true">{a.icono}</span>
              <strong>{a.titulo}</strong>
              <span>{a.texto}</span>
            </Link>
          ))}
        </nav>

        <div className="cuenta__grid">
          <section className="cuenta__reportes" aria-labelledby="mis-reportes">
            <div className="seccion-titulo">
              <h2 id="mis-reportes">Mis reportes</h2>
              {lista.length ? <Link to="/reportar" className="boton-amable boton-amable--chico">+ Nuevo reporte</Link> : null}
            </div>

            {reportes.error ? <div className="aviso-amable aviso-amable--error">{reportes.error}</div> : null}
            {reportes.cargando && !reportes.data ? <p className="cargando-amable">Cargando tus reportes…</p> : null}

            {reportes.data && !lista.length ? (
              <div className="vacio-amable">
                <span aria-hidden="true">🌱</span>
                <h3>Aún no has enviado reportes</h3>
                <p>Cuando veas algo que ponga en riesgo a tus vecinos, cuéntanos. Tu reporte es anónimo en el mapa.</p>
                <Link to="/reportar" className="boton-amable">Hacer mi primer reporte</Link>
              </div>
            ) : null}

            <div className="mis-reportes">
              {lista.map((r) => <TarjetaReporte key={r.id} reporte={r} />)}
            </div>
          </section>

          <aside className="cuenta__lateral">
            <section className="tarjeta-amable tarjeta-amable--consejo">
              <span className="tarjeta-amable__etiqueta">Consejo del día</span>
              <span className="tarjeta-amable__icono" aria-hidden="true">{c.icono}</span>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
              <button type="button" className="enlace" onClick={() => setConsejo((i) => (i + 1) % CONSEJOS.length)}>
                Otro consejo →
              </button>
            </section>

            <section className="tarjeta-amable">
              <h3>Alertas en el distrito</h3>
              {alertas.data?.length ? (
                <ul className="mini-alertas">
                  {alertas.data.slice(0, 3).map((a) => (
                    <li key={a.id} className={`mini-alerta mini-alerta--${a.nivel}`}>
                      <strong>{a.titulo}</strong>
                      {a.esDemo ? <span className="badge-demo">DEMO</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tarjeta-amable__texto">Todo tranquilo por ahora. 🌼</p>
              )}
              <Link to="/alertas" className="enlace">Ver todas las alertas →</Link>
            </section>

            <section className="tarjeta-amable">
              <h3>¿Emergencia?</h3>
              <div className="mini-emergencias">
                {EMERGENCY_NUMBERS.map((e) => (
                  <a key={e.id} href={`tel:${e.number}`}>
                    <strong>{e.number}</strong>
                    <span>{e.label}</span>
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
