import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Rectangle, Tooltip } from 'react-leaflet'
import { useAsync } from '../../../controllers/useAsync'
import { useLimite } from '../../../controllers/useLimite'
import { fetchPlanAccion, fetchPredicciones } from '../../../services/seguridadService'
import { colorTipo } from '../../../models/tipos'
import {
  IconoBaja, IconoEstable, IconoNivelAlto, IconoNivelBajo, IconoNivelMedio, IconoSube,
} from '../../../models/iconos'
import MapaBase from '../mapa/MapaBase'
import KpiCard from './KpiCard'
import Tile from './Tile'
import GraficoProyeccion from './GraficoProyeccion'
import PlanAccion from './PlanAccion'
import SkeletonPanel from './SkeletonPanel'
import '../../../assets/styles/mapa.css'

// "Probabilidad de reportes", nunca "peligrosidad": no se estigmatiza a los barrios.
// El nivel se comunica con ícono + texto + color (WCAG 1.4.1).
const NIVEL = {
  alta: { label: 'Probabilidad alta', Icono: IconoNivelAlto, color: '#DC2626' },
  media: { label: 'Probabilidad media', Icono: IconoNivelMedio, color: '#D97706' },
  baja: { label: 'Probabilidad baja', Icono: IconoNivelBajo, color: '#2563EB' },
}
const TENDENCIA = {
  sube: { label: 'Sube', Icono: IconoSube },
  baja: { label: 'Baja', Icono: IconoBaja },
  estable: { label: 'Estable', Icono: IconoEstable },
}
const HORIZONTES = [7, 30]
const hora = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' })

function Nivel({ nivel }) {
  const n = NIVEL[nivel]
  return <span className={`nivel-pred nivel-pred--${nivel}`}><n.Icono size={15} aria-hidden="true" /> {n.label}</span>
}

function Tendencia({ tendencia }) {
  const t = TENDENCIA[tendencia.direccion]
  const pct = tendencia.variacion !== null && tendencia.direccion !== 'estable' ? ` ${tendencia.variacion > 0 ? '+' : ''}${tendencia.variacion}%` : ''
  return <span className={`tendencia tendencia--${tendencia.direccion}`}><t.Icono size={15} aria-hidden="true" /> {t.label}{pct}</span>
}

const rangoTexto = (r) => (r.max === 0 ? 'Sin reportes esperados' : `${r.min}–${r.max} reportes`)

function TarjetaZona({ zona, horizonte, posicion }) {
  const r = horizonte === 7 ? zona.dias7 : zona.dias30
  return (
    <article className={`pred-card pred-card--${zona.nivel}`}>
      <div className="pred-card__cabecera">
        <span className="pred-card__rango">{posicion}</span>
        <Nivel nivel={zona.nivel} />
      </div>
      <h4 className="pred-card__nombre">{zona.nombre}</h4>
      <p className="pred-card__cifra"><strong>{rangoTexto(r)}</strong> <span>en {horizonte} días</span></p>
      <ul className="pred-card__datos">
        <li><Tendencia tendencia={zona.tendencia} /></li>
        {zona.tipoProbable ? <li><i className="punto-tipo" style={{ background: colorTipo(zona.tipoProbable.id) }} aria-hidden="true" />{zona.tipoProbable.label} ({zona.tipoProbable.porcentaje}%)</li> : null}
        {zona.franja ? <li>{zona.franja.label}</li> : null}
      </ul>
      <span className={`confianza-pred confianza-pred--${zona.confianza}`}>Confianza {zona.confianza} · {zona.soporte.reportes} reportes</span>
    </article>
  )
}

function FilaZona({ zona, horizonte, posicion }) {
  const r = horizonte === 7 ? zona.dias7 : zona.dias30
  return (
    <li className="ranking-pred__fila">
      <details>
        <summary>
          <span className="ranking-pred__pos">{posicion}</span>
          <span className="ranking-pred__nombre">{zona.nombre}</span>
          <Nivel nivel={zona.nivel} />
          <span className="ranking-pred__rango">{rangoTexto(r)}</span>
          <Tendencia tendencia={zona.tendencia} />
          <span className={`confianza-pred confianza-pred--${zona.confianza}`}>Confianza {zona.confianza}</span>
        </summary>
        <div className="ranking-pred__detalle">
          <p className="ranking-pred__subtitulo">¿Qué explica esta estimación?</p>
          <ul>{zona.factores.map((f) => <li key={f}>{f}</li>)}</ul>
          {zona.dia ? <p>Día con más reportes: <strong>{zona.dia.label}</strong> ({zona.dia.porcentaje}%).</p> : null}
          <Link to={`/mapa?lat=${zona.centro.lat}&lng=${zona.centro.lng}`}>Ver la zona en el mapa →</Link>
        </div>
      </details>
    </li>
  )
}

// Pestaña "Predicción y plan": estimación por zona con incertidumbre visible + plan de acción.
export default function PanelPrediccion({ pestanas }) {
  const [horizonte, setHorizonte] = useState(7)
  const limite = useLimite()
  const pred = useAsync((signal) => fetchPredicciones(signal), [])
  const data = pred.data
  const top = useMemo(() => (data?.zonas ?? []).slice(0, 3).map((z) => z.id), [data])
  const plan = useAsync((signal) => (top.length ? fetchPlanAccion(top, signal) : Promise.resolve({ zonas: [] })), [top.join(',')])

  const proxima = data?.distrito.proyeccion[0]
  const tablaProyeccion = data
    ? {
        caption: 'Reportes por semana en el distrito y proyección',
        columns: [
          { key: 'semana', label: 'Semana desde' },
          { key: 'tipo', label: 'Dato' },
          { key: 'valor', label: 'Reportes', numeric: true },
          { key: 'rango', label: 'Rango probable' },
        ],
        rows: [
          ...data.distrito.historico.map((h) => ({ key: h.semana, semana: h.semana, tipo: 'Real', valor: h.total, rango: '—' })),
          ...data.distrito.proyeccion.map((p) => ({ key: `p${p.semana}`, semana: p.semana, tipo: 'Proyección', valor: p.esperado, rango: `${p.min}–${p.max}` })),
        ],
      }
    : null

  return (
    <div className="pbi">
      {pestanas}
      <div className="pbi__bar">
        <div className="pbi__bar-inner">
          <div>
            <h1 className="pbi__title">Panel municipal · Predicción y plan de acción</h1>
            <p className="pbi__subtitle">
              Villa El Salvador · próximos {horizonte} días{data ? ` · calculado a las ${hora.format(new Date(data.generadoEn))} con ${data.ventana.semanas} semanas de reportes` : ''}
            </p>
          </div>
          <div className="pbi__actions">
            <div className="pbi__periodos" role="group" aria-label="Horizonte de la predicción">
              {HORIZONTES.map((d) => (
                <button key={d} type="button" className={d === horizonte ? 'pbi__btn pbi__btn--activo' : 'pbi__btn'} aria-pressed={d === horizonte} onClick={() => setHorizonte(d)}>
                  Próximos {d} días
                </button>
              ))}
            </div>
            <button type="button" className="pbi__btn" onClick={() => { pred.recargar(); plan.recargar() }} disabled={pred.cargando}>Recalcular</button>
          </div>
        </div>
      </div>

      <div className="pbi__canvas pbi__canvas--completo">
        <p className="pbi__aviso-alcance" role="note">
          <strong>Estimación basada en reportes ciudadanos, que no cubren todos los delitos.</strong> Úsese como apoyo a la decisión, no como veredicto.
        </p>

        {pred.error ? <div className="pbi__error" role="alert">No se pudo calcular la predicción: {pred.error}</div> : null}
        {!data && !pred.error ? <SkeletonPanel texto="Calculando la predicción por zona…" /> : null}

        {data ? (
          <>
            {data.incluyeDemo ? <p className="pbi__demo">Incluye reportes de demostración ({data.porcentajeDemo}% de los datos) para la presentación.</p> : null}

            <details className="metodo-pred">
              <summary>¿Cómo se calcula? <span>(se explica en 20 segundos)</span></summary>
              <ol>
                <li><strong>Contamos</strong> los reportes de cada zona (~330 m) en las últimas {data.ventana.semanas} semanas, con más peso a las recientes.</li>
                <li><strong>Ajustamos</strong> según la tendencia (últimos 14 días frente a los 14 anteriores) y la época del año en las denuncias oficiales{data.estacionalidad.disponible ? ` (${data.estacionalidad.fuente})` : ''}.</li>
                <li><strong>Damos un rango</strong>, no un número exacto. Con menos de {data.umbralMinimo} reportes, la zona aparece como "datos insuficientes".</li>
              </ol>
              <p>Solo se usan datos agregados por zona: nunca reportes individuales ni datos de quien reporta.</p>
            </details>

            <div className="pbi__kpis pbi__kpis--4">
              <KpiCard label="Reportes esperados · próxima semana" value={proxima ? `${proxima.min}–${proxima.max}` : '—'} detail={proxima ? `Valor central: ${proxima.esperado} en todo el distrito` : ''} />
              <KpiCard label="Tendencia del distrito" value={TENDENCIA[data.distrito.tendencia.direccion].label} detail={data.distrito.tendencia.variacion !== null ? `${data.distrito.tendencia.variacion > 0 ? '+' : ''}${data.distrito.tendencia.variacion}% en 14 días frente a los 14 anteriores` : 'Sin periodo previo para comparar'} />
              <KpiCard label="Zonas con predicción" value={data.zonas.length} detail={`${data.zonasInsuficientes} zonas con datos insuficientes (menos de ${data.umbralMinimo} reportes)`} />
              <KpiCard label="Ajuste estacional" value={data.estacionalidad.disponible ? `${data.estacionalidad.factor > 1 ? '+' : ''}${Math.round((data.estacionalidad.factor - 1) * 100)}%` : '—'} detail={data.estacionalidad.disponible ? `${data.estacionalidad.mesObjetivo} · ${data.estacionalidad.fuente}` : 'Sin datos SIDPOL suficientes'} />
            </div>

            {data.zonas.length ? (
              <section className="pred-top" aria-label="Zonas con mayor probabilidad de reportes">
                <h2 className="pred-seccion">Zonas con mayor probabilidad de reportes</h2>
                <div className="pred-top__grid">
                  {data.zonas.slice(0, 3).map((z, i) => <TarjetaZona key={z.id} zona={z} horizonte={horizonte} posicion={i + 1} />)}
                </div>
              </section>
            ) : (
              <p className="pred-vacio">
                <strong>Datos insuficientes.</strong> Ninguna zona tiene todavía {data.umbralMinimo} reportes en {data.ventana.semanas} semanas.
                La predicción aparecerá cuando haya más reportes vecinales.
              </p>
            )}

            <div className="pbi__grid">
              <Tile className="span-7" titulo="Proyección del distrito" subtitulo="Reportes por semana y rango probable de las próximas 4 semanas" tabla={tablaProyeccion}>
                <GraficoProyeccion historico={data.distrito.historico} proyeccion={data.distrito.proyeccion} />
              </Tile>
              <Tile className="span-5" titulo="Mapa de probabilidad" subtitulo="Zonas de ~330 m con predicción (el ranking es la versión accesible)">
                <div className="pred-mapa">
                  <MapaBase limite={limite} zoom={13} className="mapa">
                    {data.zonas.map((z) => (
                      <Rectangle
                        key={z.id}
                        bounds={[[z.limites.sur, z.limites.oeste], [z.limites.norte, z.limites.este]]}
                        pathOptions={{ color: NIVEL[z.nivel].color, weight: 2, fillColor: NIVEL[z.nivel].color, fillOpacity: 0.35 }}
                      >
                        <Tooltip>
                          <strong>{z.nombre}</strong><br />
                          {NIVEL[z.nivel].label} · {rangoTexto(horizonte === 7 ? z.dias7 : z.dias30)} en {horizonte} días
                        </Tooltip>
                      </Rectangle>
                    ))}
                  </MapaBase>
                </div>
              </Tile>

              <Tile className="span-12" titulo="Ranking de zonas" subtitulo="Toca una zona para ver qué explica su estimación">
                {data.zonas.length ? (
                  <ol className="ranking-pred">
                    {data.zonas.map((z, i) => <FilaZona key={z.id} zona={z} horizonte={horizonte} posicion={i + 1} />)}
                  </ol>
                ) : <p className="tile__nota">Sin zonas con datos suficientes.</p>}
                {data.zonasInsuficientes ? (
                  <p className="ranking-pred__insuficientes">
                    + {data.zonasInsuficientes} zonas con <strong>datos insuficientes</strong>: no se muestran para no inventar cifras ni exponer reportes aislados.
                  </p>
                ) : null}
              </Tile>

              <Tile className="span-12" titulo="Plan de acción recomendado" subtitulo="La IA propone a partir de los datos; tú decides qué se hace">
                <PlanAccion plan={plan.data} error={plan.error} cargando={plan.cargando} />
              </Tile>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
