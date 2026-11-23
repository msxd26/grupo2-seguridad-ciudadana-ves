import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchAlertas } from '../../services/seguridadService'
import { distanciaMetros } from '../../models/tipos'
import AlertaCard from '../components/AlertaCard'
import '../../assets/styles/paginas.css'

const RADIO_MI_ZONA = 1500 // metros
const EVENTOS_RECARGA = new Set(['reporte', 'reporte-moderado', 'reporte-oculto'])

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'mi-zona', label: 'Mi zona' },
  { id: 'peligro', label: 'Peligro alto' },
  { id: 'analisis', label: 'Análisis (zonas y tendencias)' },
]

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
  const alertas = conDistancia.filter((a) => {
    if (filtro === 'peligro') return a.nivel === 'alta'
    if (filtro === 'analisis') return a.tipo !== 'incidente'
    if (filtro === 'mi-zona') return posicion && a.distancia !== undefined && a.distancia <= RADIO_MI_ZONA
    return true
  })
  if (filtro === 'mi-zona') alertas.sort((a, b) => a.distancia - b.distancia)

  return (
    <section className="pagina container">
      <header className="pagina__header">
        <h1>Alertas comunitarias</h1>
        <p>Lo que reportaron tus vecinos en las últimas 24 horas, zonas con varios reportes y tendencias de las denuncias oficiales.</p>
      </header>

      <div className="segmented--claro" role="group" aria-label="Filtrar alertas">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filtro === f.id} className={filtro === f.id ? 'activo' : undefined} onClick={() => elegir(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {errorGps && filtro === 'mi-zona' ? <div className="form-error" role="alert">{errorGps}</div> : null}
      {filtro === 'mi-zona' && posicion ? <p className="pagina__nota">Mostrando alertas a menos de {RADIO_MI_ZONA / 1000} km de tu ubicación.</p> : null}
      {error ? <div className="form-error" role="alert">No se pudieron cargar las alertas: {error}</div> : null}
      {cargando && !data ? <p>Cargando alertas…</p> : null}

      {data ? (
        alertas.length ? (
          <div className="alertas-grid">
            {alertas.map((a) => <AlertaCard key={a.id} alerta={a} distancia={a.distancia} />)}
          </div>
        ) : (
          <p className="vacio">{filtro === 'mi-zona' && !posicion ? 'Esperando tu ubicación…' : 'No hay alertas de este tipo por ahora.'}</p>
        )
      ) : null}

      <section className="como-funciona">
        <h2>¿Cómo se generan?</h2>
        <ul>
          <li><strong>Reportes vecinales:</strong> cada incidente reportado en las últimas 24 horas aparece aquí al instante.</li>
          <li><strong>Zonas de riesgo:</strong> 3 o más reportes en la misma zona (~330 m) durante 7 días. Con 5 o más, el nivel es de peligro.</li>
          <li><strong>Tendencias oficiales:</strong> modalidades que crecen 10% o más en los últimos 3 meses de denuncias SIDPOL (mínimo 30).</li>
          <li><strong>Estacionales:</strong> el mes siguiente suele registrar más denuncias que un mes típico.</li>
        </ul>
        <p>¿Viste algo? <Link to="/reportar">Repórtalo aquí</Link>.</p>
      </section>
    </section>
  )
}
