import { useEstadisticas } from '../../../controllers/useEstadisticas'
import { FUENTE_POR_DEFECTO, MESES, formatNumero, periodoCorto } from '../../../models/estadisticas'
import StatTile from './StatTile'
import AnnualChart from './AnnualChart'
import MonthlyChart from './MonthlyChart'
import ModalidadChart from './ModalidadChart'
import DataTable from './DataTable'
import '../../../assets/styles/estadisticas.css'

const COLS_ANIO = [
  { key: 'anio', label: 'Año' },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
  { key: 'ultimoMes', label: 'Periodo', format: periodoCorto },
]
const COLS_MODALIDAD = [
  { key: 'modalidad', label: 'Modalidad' },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
  { key: 'porcentaje', label: '%', numeric: true },
]
const COLS_MES = [
  { key: 'mes', label: 'Mes', format: (m) => MESES[m - 1] },
  { key: 'total', label: 'Denuncias', numeric: true, format: formatNumero },
]

function deltaDe(resumen) {
  if (resumen.variacionPorcentual === null) return null
  const v = resumen.variacionPorcentual
  return {
    sube: v > 0,
    texto: `${v > 0 ? '+' : ''}${v}% vs. ${resumen.anio - 1} (${periodoCorto(resumen.ultimoMes)})`,
  }
}

export default function EstadisticasSection() {
  const { general, anio, setAnio, detalle, error, cargando } = useEstadisticas()
  const fuente = general?.fuente ?? FUENTE_POR_DEFECTO

  return (
    <section className="stats container" id="estadisticas" aria-labelledby="stats-title">
      <header className="stats__header">
        <h2 id="stats-title">Denuncias policiales en Villa El Salvador</h2>
        <p>
          Datos oficiales del {fuente.sistema}, publicados por el {fuente.entidad} en la{' '}
          <a href={fuente.url} target="_blank" rel="noreferrer">{fuente.portal}</a>.
        </p>
      </header>

      {error && !detalle ? (
        <div className="stats__error" role="alert">
          No se pudieron cargar las estadísticas: {error}.
        </div>
      ) : null}

      {general && detalle ? (
        <div className={cargando ? 'stats__body stats__body--loading' : 'stats__body'} aria-busy={cargando}>
          <div className="stats__filters" role="group" aria-label="Seleccionar año">
            {general.porAnio.map((d) => (
              <button
                key={d.anio}
                type="button"
                className={d.anio === anio ? 'chip chip--active' : 'chip'}
                aria-pressed={d.anio === anio}
                onClick={() => setAnio(d.anio)}
              >
                {d.anio}
              </button>
            ))}
          </div>

          <div className="stats__tiles">
            <StatTile
              label={`Denuncias en ${detalle.resumen.anio}`}
              value={formatNumero(detalle.resumen.total)}
              detail={periodoCorto(detalle.resumen.ultimoMes)}
              delta={deltaDe(detalle.resumen)}
            />
            <StatTile
              label="Promedio mensual"
              value={formatNumero(detalle.resumen.promedioMensual)}
              detail={`≈ ${formatNumero(Math.round(detalle.resumen.promedioMensual / 30))} denuncias por día`}
            />
            <StatTile
              label="Modalidad más denunciada"
              value={`${detalle.resumen.modalidadPrincipal.porcentaje}%`}
              detail={detalle.resumen.modalidadPrincipal.modalidad}
            />
          </div>

          <div className="stats__grid">
            <article className="card card--wide">
              <h3 className="card__title">Evolución anual</h3>
              <p className="card__subtitle">Total de denuncias registradas por año</p>
              <AnnualChart data={general.porAnio} anioSeleccionado={anio} onSelect={setAnio} />
              <DataTable caption="Denuncias por año" columns={COLS_ANIO} rows={general.porAnio} />
            </article>

            <article className="card">
              <h3 className="card__title">Por modalidad · {anio}</h3>
              <p className="card__subtitle">Principales modalidades delictivas</p>
              <ModalidadChart data={detalle.porModalidad} />
              <DataTable caption={`Denuncias por modalidad en ${anio}`} columns={COLS_MODALIDAD} rows={detalle.porModalidad} />
            </article>

            <article className="card">
              <h3 className="card__title">Por mes · {anio}</h3>
              <p className="card__subtitle">Comparado con el año anterior</p>
              <MonthlyChart anio={anio} actual={detalle.porMes} anterior={detalle.porMesAnterior} />
              <DataTable caption={`Denuncias por mes en ${anio}`} columns={COLS_MES} rows={detalle.porMes} />
            </article>
          </div>

          <p className="stats__source">
            Fuente: {fuente.entidad} – {fuente.sistema}. Denuncias según el distrito donde ocurrió el
            hecho (ubigeo 150142). “Otros” agrupa los delitos que no están entre las modalidades principales.
          </p>
        </div>
      ) : null}

      {!general && !error ? <p className="stats__loading">Cargando estadísticas…</p> : null}
    </section>
  )
}
