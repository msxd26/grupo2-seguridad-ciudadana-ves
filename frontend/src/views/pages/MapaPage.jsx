import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleMarker } from 'react-leaflet'
import { useAsync } from '../../controllers/useAsync'
import { useEventos } from '../../context/EventosContext'
import { fetchMapa } from '../../services/seguridadService'
import { PERIODOS } from '../../models/mapa'
import { TIPOS } from '../../models/tipos'
import { IconoAtencion, IconoCalor, IconoDesplegar, IconoPeligro, IconoPin, IconoUbicacion } from '../../models/iconos'
import MapaBase from '../components/mapa/MapaBase'
import CapaCalor from '../components/mapa/CapaCalor'
import { CapaComisarias, CapaReportes, CapaZonas } from '../components/mapa/capas'
import PanelEnVivo from '../components/mapa/PanelEnVivo'
import LeyendaMapa from '../components/mapa/LeyendaMapa'
import '../../assets/styles/mapa.css'

// Nivel de la zona con ícono + texto (nunca solo color).
const NIVEL_ZONA_BADGE = {
  alto: { label: 'Peligro', Icono: IconoPeligro },
  medio: { label: 'Atención', Icono: IconoAtencion },
}

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
  const [votos, setVotos] = useState(() => new Map()) // id -> { confirmaciones, marcas } en vivo
  const [seguir, setSeguir] = useState(true)
  const [seleccionado, setSeleccionado] = useState(null)
  const [miPosicion, setMiPosicion] = useState(null)
  const [ubicando, setUbicando] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState(null)
  const [hojaAbierta, setHojaAbierta] = useState(false) // hoja inferior (solo celulares)
  const seguirRef = useRef(seguir)
  seguirRef.current = seguir

  const tipos = useMemo(() => (tipo ? [tipo] : []), [tipo])
  const { data, error, cargando } = useAsync((signal) => fetchMapa({ dias, tipos }, signal), [dias, tipo])

  // Al recargar los datos, los reportes en vivo ya vienen incluidos.
  useEffect(() => setEnVivo([]), [data])

  // Nuevos reportes en tiempo real: aparecen en el mapa sin recargar.
  useEffect(
    () =>
      suscribir((evento, datos) => {
        if (evento === 'reporte' && (!tipo || datos.tipo === tipo)) {
          setEnVivo((v) => [datos, ...v])
          // "Seguir en vivo": el mapa vuela al reporte nuevo y abre su ficha.
          if (seguirRef.current) {
            setDestino({ lat: datos.lat, lng: datos.lng, zoom: 16 })
            setSeleccionado(datos.id)
          }
        }
        if (evento === 'reporte-actualizado') setVotos((m) => new Map(m).set(datos.id, { ...m.get(datos.id), ...datos }))
        // Moderación en vivo: un descartado desaparece de todos los mapas; un verificado muestra su sello.
        if (evento === 'reporte-moderado') {
          if (datos.estado === 'descartado' || datos.oculto) setOcultos((s) => new Set(s).add(datos.id))
          else {
            setOcultos((s) => { if (!s.has(datos.id)) return s; const n = new Set(s); n.delete(datos.id); return n })
            setVotos((m) => new Map(m).set(datos.id, { ...m.get(datos.id), estado: datos.estado }))
          }
        }
        if (evento === 'reporte-oculto') setOcultos((s) => new Set(s).add(datos.id))
      }),
    [suscribir, tipo],
  )

  const reportes = useMemo(() => {
    const base = data?.reportes ?? []
    const ids = new Set(base.map((r) => r.id))
    return [...enVivo.filter((r) => !ids.has(r.id)), ...base]
      .filter((r) => !ocultos.has(r.id))
      .map((r) => (votos.has(r.id) ? { ...r, ...votos.get(r.id) } : r))
  }, [data, enVivo, ocultos, votos])
  const nuevos = useMemo(() => new Set(enVivo.map((r) => r.id)), [enVivo])
  const puntos = useMemo(() => reportes.map((r) => [r.lat, r.lng]), [reportes])

  // "Mi ubicación": referencia espacial para quien no conoce el mapa (adultos mayores).
  const irAMiUbicacion = () => {
    if (!navigator.geolocation) return setErrorUbicacion('Tu navegador no permite obtener la ubicación.')
    setUbicando(true)
    setErrorUbicacion(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const punto = { lat: coords.latitude, lng: coords.longitude }
        setMiPosicion(punto)
        setDestino({ ...punto, zoom: 16 })
        setUbicando(false)
      },
      () => {
        setErrorUbicacion('No pudimos obtener tu ubicación. Activa el permiso de ubicación.')
        setUbicando(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const toggleCapa = (id) => setVisibles((v) => ({ ...v, [id]: !v[id] }))
  const ocultar = (id) => setOcultos((s) => new Set(s).add(id))
  const zonasDestacadas = data?.zonas.filter((z) => z.nivel !== 'bajo').slice(0, 5) ?? []
  const hayDemo = reportes.some((r) => r.esDemo)

  return (
    <div className="mapa-page">
      <aside className={hojaAbierta ? 'mapa-panel mapa-panel--abierta' : 'mapa-panel'} aria-label="Controles del mapa">
        {/* En celulares el panel es una hoja inferior: el mapa queda visible y la hoja se despliega con un toque. */}
        <button type="button" className="mapa-panel__asa" aria-expanded={hojaAbierta} aria-controls="mapa-panel-cuerpo" onClick={() => setHojaAbierta((a) => !a)}>
          <span className="mapa-panel__asa-barra" aria-hidden="true" />
          <span>{hojaAbierta ? 'Ocultar filtros' : 'Filtros y zonas críticas'}</span>
          {zonasDestacadas.length ? <span className="mapa-panel__asa-n">{zonasDestacadas.length} zonas</span> : null}
          <IconoDesplegar size={20} aria-hidden="true" className="mapa-panel__asa-icono" />
        </button>

        <div id="mapa-panel-cuerpo" className="mapa-panel__cuerpo">
          <div>
            <h1 className="mapa-panel__title">Mapa de incidentes</h1>
            <p className="mapa-panel__desc">Lo que reportan los vecinos de Villa El Salvador, en tiempo real.</p>
          </div>

          <section className="mapa-panel__seccion" aria-labelledby="sec-filtros">
            <h2 id="sec-filtros" className="mapa-panel__seccion-titulo">Filtros</h2>
            <div className="mapa-panel__grupo">
              <span className="mapa-panel__label" id="m-periodo">¿De cuándo son los reportes?</span>
              <div className="segmented segmented--periodos" role="group" aria-labelledby="m-periodo">
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
          </section>

          <section className="mapa-panel__seccion" aria-labelledby="sec-capas">
            <h2 id="sec-capas" className="mapa-panel__seccion-titulo">Capas</h2>
            <fieldset className="mapa-panel__grupo">
              <legend className="sr-only">Capas visibles en el mapa</legend>
              {CAPAS.map((c) => (
                <label key={c.id} className="mapa-panel__check">
                  <input type="checkbox" checked={visibles[c.id]} onChange={() => toggleCapa(c.id)} /> {c.label}
                </label>
              ))}
            </fieldset>
          </section>

          {data ? (
            <section className="mapa-panel__seccion" aria-labelledby="sec-zonas">
              <h2 id="sec-zonas" className="mapa-panel__seccion-titulo">Zonas críticas</h2>
              <p className="mapa-panel__resumen">
                <strong>{reportes.length}</strong> incidentes · <strong>{zonasDestacadas.length}</strong> zonas críticas
              </p>
              {zonasDestacadas.length ? (
                <ol className="zonas-lista">
                  {zonasDestacadas.map((z) => {
                    const nivel = NIVEL_ZONA_BADGE[z.nivel]
                    return (
                      <li key={z.id}>
                        <button type="button" onClick={() => { setDestino({ lat: (z.sur + z.norte) / 2, lng: (z.oeste + z.este) / 2, zoom: 17 }); setHojaAbierta(false) }}>
                          <span className={`zona-badge zona-badge--${z.nivel}`}><nivel.Icono size={13} aria-hidden="true" /> {nivel.label}</span>
                          <span className="zonas-lista__texto">
                            <strong>{TIPOS.find((t) => t.id === z.tipoPrincipal)?.label ?? 'Varios'}</strong>
                            <span>{z.cantidad} reportes</span>
                          </span>
                          <span className="zonas-lista__ir">Ver zona →</span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className="mapa-panel__vacio">Todo tranquilo por ahora. Si ves algo, <Link to="/reportar">puedes reportarlo aquí →</Link></p>
              )}
            </section>
          ) : null}

          {hayDemo ? <p className="aviso-demo">Incluye reportes <strong>de demostración</strong> (marcados como DEMO).</p> : null}

          {data ? (
            <p className="mapa-panel__fuente">
              Comisarías: <a href={data.fuentes.comisarias.url} target="_blank" rel="noreferrer">{data.fuentes.comisarias.entidad}</a> ·
              Límite: <a href={data.fuentes.limite.url} target="_blank" rel="noreferrer">{data.fuentes.limite.entidad}</a>
            </p>
          ) : null}
        </div>
      </aside>

      <div className="mapa-contenedor">
        {error ? <div className="mapa-error" role="alert">No se pudo cargar el mapa: {error}</div> : null}
        {cargando && !data ? (
          <div className="mapa-carga-inicial" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Cargando mapa…</p>
          </div>
        ) : null}
        {cargando && data ? <div className="mapa-cargando" role="status">Actualizando…</div> : null}
        {errorUbicacion ? <div className="mapa-error mapa-error--ubicacion" role="alert">{errorUbicacion}</div> : null}
        <button type="button" className={visibles.calor ? 'boton-calor boton-calor--activo' : 'boton-calor'} onClick={() => toggleCapa('calor')} aria-pressed={visibles.calor} title="Mostrar u ocultar el mapa de calor">
          <IconoCalor size={18} aria-hidden="true" /> Calor
        </button>
        <MapaBase limite={data?.limite} destino={destino} className="mapa">
          {visibles.calor ? <CapaCalor puntos={puntos} /> : null}
          {data && visibles.zonas ? <CapaZonas zonas={data.zonas} /> : null}
          {visibles.reportes ? <CapaReportes reportes={reportes} nuevos={nuevos} onOculto={ocultar} abrirId={seleccionado} /> : null}
          {data && visibles.comisarias ? <CapaComisarias comisarias={data.comisarias} /> : null}
          {miPosicion ? <CircleMarker center={[miPosicion.lat, miPosicion.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1D4ED8', fillOpacity: 1 }} /> : null}
          {destino ? <CircleMarker center={[destino.lat, destino.lng]} radius={22} pathOptions={{ color: '#1E3A8A', weight: 2, fill: false, dashArray: '4 4' }} /> : null}
        </MapaBase>
        <button type="button" className="boton-ubicacion" onClick={irAMiUbicacion} disabled={ubicando} aria-label="Centrar el mapa en mi ubicación" title="Mi ubicación">
          {ubicando ? <span className="spinner" aria-hidden="true" /> : <IconoUbicacion size={22} aria-hidden="true" />}
        </button>
        <LeyendaMapa />
        <PanelEnVivo
          reportes={reportes}
          nuevos={nuevos}
          seguir={seguir}
          onSeguir={setSeguir}
          seleccionado={seleccionado}
          onElegir={(r) => { setDestino({ lat: r.lat, lng: r.lng, zoom: 17 }); setSeleccionado(r.id) }}
        />
        <Link to="/reportar" className="fab-reportar" aria-label="Reportar un incidente">
          <IconoPin size={22} aria-hidden="true" /> <span>Reportar</span>
        </Link>
      </div>
    </div>
  )
}
