import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleMarker } from 'react-leaflet'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchMapa } from '../../services/seguridadService'
import { NIVELES_ZONA, PERIODOS } from '../../models/mapa'
import { TIPOS } from '../../models/tipos'
import { IconoCalor, IconoPin } from '../../models/iconos'
import MapaBase from '../components/mapa/MapaBase'
import CapaCalor from '../components/mapa/CapaCalor'
import { CapaComisarias, CapaReportes, CapaZonas } from '../components/mapa/capas'
import '../../assets/styles/mapa.css'

const CAPAS = [
  { id: 'calor', label: 'Mapa de calor' },
  { id: 'reportes', label: 'Incidentes' },
  { id: 'zonas', label: 'Zonas de riesgo (cuadrícula)' },
  { id: 'comisarias', label: 'Puntos seguros (comisarías)' },
]

export default function MapaPage() {
  const [params] = useSearchParams()
  const { suscribir } = useEventos()
  const [dias, setDias] = useState(7)
  const [tipo, setTipo] = useState('')
  const [visibles, setVisibles] = useState({ calor: true, reportes: true, zonas: false, comisarias: true })
  const [destino, setDestino] = useState(() => {
    const lat = Number(params.get('lat'))
    const lng = Number(params.get('lng'))
    return lat && lng ? { lat, lng, zoom: 17 } : null
  })
  const [enVivo, setEnVivo] = useState([]) // reportes llegados por tiempo real
  const [ocultos, setOcultos] = useState(() => new Set())

  const tipos = useMemo(() => (tipo ? [tipo] : []), [tipo])
  const { data, error, cargando } = useAsync((signal) => fetchMapa({ dias, tipos }, signal), [dias, tipo])

  // Al recargar los datos, los reportes en vivo ya vienen incluidos.
  useEffect(() => setEnVivo([]), [data])

  // Nuevos reportes en tiempo real: aparecen en el mapa sin recargar.
  useEffect(
    () =>
      suscribir((evento, datos) => {
        if (evento === 'reporte' && (!tipo || datos.tipo === tipo)) setEnVivo((v) => [datos, ...v])
        if (evento === 'reporte-oculto') setOcultos((s) => new Set(s).add(datos.id))
      }),
    [suscribir, tipo],
  )

  const reportes = useMemo(() => {
    const base = data?.reportes ?? []
    const ids = new Set(base.map((r) => r.id))
    return [...enVivo.filter((r) => !ids.has(r.id)), ...base].filter((r) => !ocultos.has(r.id))
  }, [data, enVivo, ocultos])
  const nuevos = useMemo(() => new Set(enVivo.map((r) => r.id)), [enVivo])
  const puntos = useMemo(() => reportes.map((r) => [r.lat, r.lng]), [reportes])

  const toggleCapa = (id) => setVisibles((v) => ({ ...v, [id]: !v[id] }))
  const ocultar = (id) => setOcultos((s) => new Set(s).add(id))
  const zonasDestacadas = data?.zonas.filter((z) => z.nivel !== 'bajo').slice(0, 5) ?? []
  const hayDemo = reportes.some((r) => r.esDemo)

  return (
    <div className="mapa-page">
      <aside className="mapa-panel" aria-label="Controles del mapa">
        <div>
          <h1 className="mapa-panel__title">Mapa de incidentes</h1>
          <p className="mapa-panel__desc">Lo que reportan los vecinos de Villa El Salvador, en tiempo real.</p>
        </div>

        <div className="mapa-panel__grupo">
          <span className="mapa-panel__label">Periodo</span>
          <div className="segmented" role="group" aria-label="Periodo">
            {PERIODOS.map((p) => (
              <button key={p.dias} type="button" aria-pressed={dias === p.dias} className={dias === p.dias ? 'activo' : undefined} onClick={() => setDias(p.dias)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mapa-panel__grupo">
          <label className="mapa-panel__label" htmlFor="m-tipo">Tipo de incidente</label>
          <select id="m-tipo" className="mapa-panel__select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <fieldset className="mapa-panel__grupo">
          <legend className="mapa-panel__label">Capas</legend>
          {CAPAS.map((c) => (
            <label key={c.id} className="mapa-panel__check">
              <input type="checkbox" checked={visibles[c.id]} onChange={() => toggleCapa(c.id)} /> {c.label}
            </label>
          ))}
        </fieldset>

        <div className="mapa-panel__grupo">
          <span className="mapa-panel__label">Leyenda</span>
          <ul className="leyenda">
            {TIPOS.map((t) => (
              <li key={t.id}><i className="leyenda__punto" style={{ background: t.color }} />{t.label}</li>
            ))}
            <li><i className="leyenda__seguro" />Punto seguro (comisaría)</li>
          </ul>
        </div>

        {data ? (
          <div className="mapa-panel__grupo">
            <span className="mapa-panel__label">Resumen</span>
            <p className="mapa-panel__resumen">
              <strong>{reportes.length}</strong> incidentes · <strong>{zonasDestacadas.length}</strong> zonas críticas
            </p>
            {zonasDestacadas.length ? (
              <ol className="zonas-lista">
                {zonasDestacadas.map((z) => (
                  <li key={z.id}>
                    <button type="button" onClick={() => setDestino({ lat: (z.sur + z.norte) / 2, lng: (z.oeste + z.este) / 2, zoom: 17 })}>
                      <i style={{ background: NIVELES_ZONA[z.nivel].color }} />
                      {z.cantidad} reportes · {TIPOS.find((t) => t.id === z.tipoPrincipal)?.label}
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}

        {hayDemo ? <p className="aviso-demo">Incluye reportes <strong>de demostración</strong> (marcados como DEMO).</p> : null}

        {data ? (
          <p className="mapa-panel__fuente">
            Comisarías: <a href={data.fuentes.comisarias.url} target="_blank" rel="noreferrer">{data.fuentes.comisarias.entidad}</a> ·
            Límite: <a href={data.fuentes.limite.url} target="_blank" rel="noreferrer">{data.fuentes.limite.entidad}</a>
          </p>
        ) : null}
      </aside>

      <div className="mapa-contenedor">
        {error ? <div className="mapa-error" role="alert">No se pudo cargar el mapa: {error}</div> : null}
        {cargando ? <div className="mapa-cargando">Actualizando…</div> : null}
        <button type="button" className={visibles.calor ? 'boton-calor boton-calor--activo' : 'boton-calor'} onClick={() => toggleCapa('calor')} aria-pressed={visibles.calor}>
          <IconoCalor size={18} aria-hidden="true" /> Calor
        </button>
        <MapaBase limite={data?.limite} destino={destino} className="mapa">
          {visibles.calor ? <CapaCalor puntos={puntos} /> : null}
          {data && visibles.zonas ? <CapaZonas zonas={data.zonas} /> : null}
          {visibles.reportes ? <CapaReportes reportes={reportes} nuevos={nuevos} onOculto={ocultar} /> : null}
          {data && visibles.comisarias ? <CapaComisarias comisarias={data.comisarias} /> : null}
          {destino ? <CircleMarker center={[destino.lat, destino.lng]} radius={22} pathOptions={{ color: '#1E3A8A', weight: 2, fill: false, dashArray: '4 4' }} /> : null}
        </MapaBase>
        <Link to="/reportar" className="fab-reportar" aria-label="Reportar un incidente">
          <IconoPin size={22} aria-hidden="true" /> <span>Reportar</span>
        </Link>
      </div>
    </div>
  )
}
