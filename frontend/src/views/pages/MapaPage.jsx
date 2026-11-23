import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleMarker } from 'react-leaflet'
import { useAsync } from '../../controllers/useAsync'
import { fetchMapa } from '../../services/seguridadService'
import { GRUPOS_REPORTE, NIVELES_ZONA, PERIODOS } from '../../models/mapa'
import MapaBase from '../components/mapa/MapaBase'
import { CapaComisarias, CapaReportes, CapaZonas } from '../components/mapa/capas'
import '../../assets/styles/mapa.css'

const CAPAS = [
  { id: 'zonas', label: 'Zonas de riesgo' },
  { id: 'reportes', label: 'Reportes ciudadanos' },
  { id: 'comisarias', label: 'Comisarías PNP' },
]

export default function MapaPage() {
  const [params] = useSearchParams()
  const [dias, setDias] = useState(30)
  const [grupo, setGrupo] = useState('')
  const [visibles, setVisibles] = useState({ zonas: true, reportes: true, comisarias: true })
  const [destino, setDestino] = useState(() => {
    const lat = Number(params.get('lat'))
    const lng = Number(params.get('lng'))
    return lat && lng ? { lat, lng, zoom: 17 } : null
  })

  const tipos = useMemo(() => GRUPOS_REPORTE.find((g) => g.label === grupo)?.tipos ?? [], [grupo])
  const { data, error, cargando } = useAsync((signal) => fetchMapa({ dias, tipos }, signal), [dias, grupo])

  const toggleCapa = (id) => setVisibles((v) => ({ ...v, [id]: !v[id] }))
  const zonasDestacadas = data?.zonas.filter((z) => z.nivel !== 'bajo').slice(0, 6) ?? []
  const hayDemo = data?.reportes.some((r) => r.esDemo)

  return (
    <div className="mapa-page">
      <aside className="mapa-panel" aria-label="Controles del mapa">
        <div>
          <h1 className="mapa-panel__title">Mapa de riesgo</h1>
          <p className="mapa-panel__desc">
            Reportes ciudadanos agrupados en zonas de ~330 m, comisarías de la PNP y límite de Villa El Salvador.
          </p>
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
          <select id="m-tipo" className="mapa-panel__select" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
            <option value="">Todos</option>
            {GRUPOS_REPORTE.map((g) => <option key={g.label} value={g.label}>{g.label}</option>)}
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
            {Object.values(NIVELES_ZONA).map((n) => (
              <li key={n.label}><i className="leyenda__zona" style={{ background: n.color }} />{n.label}</li>
            ))}
            {GRUPOS_REPORTE.map((g) => (
              <li key={g.label}><i className="leyenda__punto" style={{ background: g.color }} />{g.label}</li>
            ))}
            <li><i className="leyenda__comisaria" />Comisaría PNP</li>
          </ul>
        </div>

        {data ? (
          <div className="mapa-panel__grupo">
            <span className="mapa-panel__label">Resumen ({dias} días)</span>
            <p className="mapa-panel__resumen">
              <strong>{data.reportes.length}</strong> reportes · <strong>{data.zonas.filter((z) => z.nivel !== 'bajo').length}</strong> zonas con concentración
            </p>
            {zonasDestacadas.length ? (
              <ol className="zonas-lista">
                {zonasDestacadas.map((z) => (
                  <li key={z.id}>
                    <button type="button" onClick={() => setDestino({ lat: (z.sur + z.norte) / 2, lng: (z.oeste + z.este) / 2, zoom: 17 })}>
                      <i style={{ background: NIVELES_ZONA[z.nivel].color }} />
                      {z.cantidad} reportes · {z.tipoPrincipal}
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}

        {hayDemo ? (
          <p className="aviso-demo">
            Incluye reportes <strong>de demostración</strong> generados para probar el sistema (marcados como DEMO).
          </p>
        ) : null}

        <Link to="/reportar" className="btn btn--alert mapa-panel__cta">Reportar un incidente</Link>

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
        <MapaBase limite={data?.limite} destino={destino} className="mapa">
          {data && visibles.zonas ? <CapaZonas zonas={data.zonas} /> : null}
          {data && visibles.reportes ? <CapaReportes reportes={data.reportes} /> : null}
          {data && visibles.comisarias ? <CapaComisarias comisarias={data.comisarias} /> : null}
          {destino ? <CircleMarker center={[destino.lat, destino.lng]} radius={22} pathOptions={{ color: '#0f1b2d', weight: 2, fill: false, dashArray: '4 4' }} /> : null}
        </MapaBase>
      </div>
    </div>
  )
}
