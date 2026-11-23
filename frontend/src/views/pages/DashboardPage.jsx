import { useState } from 'react'
import { useDashboard } from '../../controllers/useDashboard'
import { MESES, MESES_CORTOS, formatNumero, formatVariacion, nombreModalidadCorto } from '../../models/estadisticas'
import SlicerPanel from '../components/dashboard/SlicerPanel'
import Tile from '../components/dashboard/Tile'
import KpiCard from '../components/dashboard/KpiCard'
import TrendChart from '../components/dashboard/TrendChart'
import ColumnChart from '../components/dashboard/ColumnChart'
import HBarList from '../components/dashboard/HBarList'
import Heatmap from '../components/dashboard/Heatmap'
import PriorityTable from '../components/dashboard/PriorityTable'
import Insights from '../components/dashboard/Insights'
import { exportarCsv } from '../components/dashboard/exportarCsv'
import '../../assets/styles/dashboard.css'

const COLS_MES = [
  { key: 'anio', label: 'Año' },
  { key: 'mes', label: 'Mes', format: (m) => MESES[m - 1] },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
  { key: 'promedioMovil', label: 'Tendencia', numeric: true, format: (v) => (v === null ? '—' : formatNumero(v)) },
]
const COLS_MODALIDAD = [
  { key: 'modalidad', label: 'Modalidad' },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
  { key: 'participacion', label: '%', numeric: true },
  { key: 'variacion', label: 'Variación', numeric: true, format: formatVariacion },
]
const COLS_ANIO = [
  { key: 'anio', label: 'Año' },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
  { key: 'ultimoMes', label: 'Meses', numeric: true },
]
const COLS_RANKING = [
  { key: 'posicion', label: '#', numeric: true },
  { key: 'distrito', label: 'Distrito' },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
]
const COLS_ESTACIONAL = [
  { key: 'mes', label: 'Mes', format: (m) => MESES[m - 1] },
  { key: 'promedio', label: 'Promedio', numeric: true, format: formatNumero },
]

export default function DashboardPage() {
  const { catalogos, data, error, cargando, modalidadesSeleccionadas, hayFiltros, acciones } = useDashboard()
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  if (error && !data) {
    return (
      <div className="pbi pbi--estado">
        <div className="pbi__error" role="alert">No se pudo cargar el panel: {error}</div>
      </div>
    )
  }
  if (!data || !catalogos) {
    return <div className="pbi pbi--estado"><p>Cargando panel de decisión…</p></div>
  }

  const { kpis, filtros, ranking } = data
  const hayPrevio = kpis.variacion !== null
  const sel = modalidadesSeleccionadas
  const unAnio = filtros.desde === filtros.hasta

  const itemsModalidad = data.porModalidad.map((m) => ({
    key: m.id,
    label: nombreModalidadCorto(m.modalidad),
    value: m.total,
    extra: `· ${m.participacion}%${hayPrevio ? ` · ${formatVariacion(m.variacion)}` : ''}`,
    activo: sel.includes(m.id),
    atenuado: sel.length > 0 && !sel.includes(m.id),
    title: `${m.modalidad}: ${formatNumero(m.total)}. Clic para filtrar.`,
  }))

  const itemsAnio = data.porAnio.map((a) => ({
    key: a.anio,
    label: a.completo ? `${a.anio}` : `${a.anio}*`,
    labelCorto: `'${String(a.anio).slice(2)}${a.completo ? '' : '*'}`,
    value: a.total,
    activo: unAnio,
    tooltip: [`${a.anio}`, `${formatNumero(a.total)} denuncias`, a.completo ? 'Año completo' : `Hasta ${MESES[a.ultimoMes - 1]}`],
  }))

  const itemsEstacional = data.estacionalidad.map((e) => ({
    key: e.mes,
    label: MESES_CORTOS[e.mes - 1],
    value: e.promedio,
    tooltip: [MESES[e.mes - 1], `Promedio: ${formatNumero(e.promedio)} denuncias`],
  }))

  const itemsRanking = ranking.lista.map((d) => ({
    key: d.ubigeo,
    label: d.distrito,
    value: d.total,
    destacado: d.ubigeo === filtros.distrito.ubigeo,
    title: `Clic para ver ${d.distrito}`,
    posicion: d.posicion,
  }))

  const delta = hayPrevio
    ? { sube: kpis.variacion > 0, malo: kpis.variacion > 0, texto: `${formatVariacion(kpis.variacion)} vs. periodo anterior` }
    : null

  const chips = [
    filtros.distrito.ubigeo !== '150142' && { key: 'd', label: filtros.distrito.nombre, quitar: () => acciones.setDistrito(null) },
    ...sel.map((id) => ({
      key: id,
      label: nombreModalidadCorto(catalogos.modalidades.find((m) => m.id === id)?.nombre ?? id),
      quitar: () => acciones.toggleModalidad(id),
    })),
  ].filter(Boolean)

  return (
    <div className="pbi">
      <div className="pbi__bar">
        <div className="pbi__bar-inner">
          <div>
            <h1 className="pbi__title">Panel de decisión · Seguridad ciudadana</h1>
            <p className="pbi__subtitle">
              {filtros.distrito.nombre} · {data.periodo}
              {data.periodoPrevio ? <> · comparado con {data.periodoPrevio}</> : null}
            </p>
          </div>
          <div className="pbi__actions">
            <button type="button" className="pbi__btn pbi__btn--filtros" onClick={() => setFiltrosAbiertos(true)}>
              Filtros{hayFiltros ? ' •' : ''}
            </button>
            <button type="button" className="pbi__btn" onClick={compartir}>{copiado ? '✓ Enlace copiado' : 'Compartir vista'}</button>
            <button type="button" className="pbi__btn pbi__btn--primario" onClick={() => exportarCsv(data)}>Exportar CSV</button>
          </div>
        </div>
      </div>

      <div className="pbi__body">
        <SlicerPanel
          catalogos={catalogos}
          filtros={filtros}
          seleccionadas={sel}
          acciones={acciones}
          abierto={filtrosAbiertos}
          onCerrar={() => setFiltrosAbiertos(false)}
        />

        <div className={cargando ? 'pbi__canvas pbi__canvas--cargando' : 'pbi__canvas'} aria-busy={cargando}>
          {chips.length ? (
            <div className="pbi__chips" aria-label="Filtros activos">
              {chips.map((c) => (
                <button key={c.key} type="button" className="filtro-chip" onClick={c.quitar}>
                  {c.label} <span aria-hidden="true">×</span><span className="sr-only">Quitar filtro</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="pbi__kpis">
            <KpiCard label="Denuncias registradas" value={formatNumero(kpis.total)} delta={delta} detail={hayPrevio ? `Periodo anterior: ${formatNumero(kpis.totalPrevio)}` : 'Sin periodo anterior comparable'} />
            <KpiCard label="Promedio mensual" value={formatNumero(kpis.promedioMensual)} detail={`≈ ${formatNumero(Math.round(kpis.promedioMensual / 30))} por día · ${kpis.meses} meses`} />
            <KpiCard label="Mes con más denuncias" value={formatNumero(kpis.mesPico.total)} detail={`${MESES[kpis.mesPico.mes - 1]} ${kpis.mesPico.anio}`} />
            <KpiCard
              label="Posición en Lima Metropolitana"
              value={ranking.posicion ? `#${ranking.posicion} de ${ranking.de}` : '—'}
              detail={`${ranking.participacion}% de las denuncias de Lima`}
            />
          </div>

          <div className="pbi__grid">
            <Tile className="span-8" titulo="Tendencia mensual" subtitulo="Denuncias por mes y su tendencia" tabla={{ caption: 'Denuncias por mes', columns: COLS_MES, rows: data.serieMensual }}>
              <TrendChart serie={data.serieMensual} />
            </Tile>

            <Tile className="span-4" titulo="Hallazgos clave" subtitulo="Generados a partir de los datos filtrados">
              <Insights hallazgos={data.hallazgos} />
            </Tile>

            <Tile className="span-5" titulo="Denuncias por modalidad" subtitulo="Clic en una barra para filtrar" tabla={{ caption: 'Por modalidad', columns: COLS_MODALIDAD, rows: data.porModalidad }}>
              <HBarList items={itemsModalidad} onSelect={acciones.toggleModalidad} ariaLabel="Denuncias por modalidad" />
            </Tile>

            <Tile className="span-7" titulo="Matriz de priorización" subtitulo="Qué modalidades atender primero">
              <PriorityTable modalidades={data.porModalidad} hayPrevio={hayPrevio} onSelect={acciones.toggleModalidad} seleccionadas={sel} />
            </Tile>

            <Tile className="span-4" titulo="Evolución anual" subtitulo="Clic en un año para enfocarlo" tabla={{ caption: 'Por año', columns: COLS_ANIO, rows: data.porAnio }}>
              <ColumnChart items={itemsAnio} onSelect={acciones.setAnio} ariaLabel="Denuncias por año" etiquetaValor="max" />
              {data.porAnio.some((a) => !a.completo) ? <p className="tile__nota">* Año con datos parciales.</p> : null}
            </Tile>

            <Tile className="span-8" titulo="Mapa de calor año × mes" subtitulo="Intensidad de denuncias: detecta meses atípicos">
              <Heatmap serie={data.serieMensual} onSelectAnio={acciones.setAnio} />
            </Tile>

            <Tile className="span-6" titulo="Ranking de distritos de Lima" subtitulo={`Top 15 en el periodo · clic para comparar`} tabla={{ caption: 'Ranking', columns: COLS_RANKING, rows: ranking.lista }}>
              <HBarList items={itemsRanking} onSelect={(u) => acciones.setDistrito(u === '150142' ? null : u)} ariaLabel="Ranking de distritos" prefijo={(d) => `${d.posicion}.`} compacto />
            </Tile>

            <Tile className="span-6" titulo="Estacionalidad" subtitulo="Promedio de denuncias por mes del año" tabla={{ caption: 'Estacionalidad', columns: COLS_ESTACIONAL, rows: data.estacionalidad }}>
              <ColumnChart items={itemsEstacional} ariaLabel="Promedio de denuncias por mes del año" etiquetaValor="max" />
            </Tile>
          </div>

          <p className="pbi__fuente">
            Fuente: {data.fuente.entidad} – {data.fuente.sistema}, vía la{' '}
            <a href={data.fuente.url} target="_blank" rel="noreferrer">{data.fuente.portal}</a>. Denuncias según el
            distrito donde ocurrió el hecho. La comparación usa el periodo anterior de igual duración y los mismos meses.
          </p>
        </div>
      </div>
    </div>
  )
}
