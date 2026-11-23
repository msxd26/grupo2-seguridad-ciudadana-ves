import { useEffect, useState } from 'react'
import { useEventos } from '../../../context/EventosContext'
import { Link } from 'react-router-dom'
import { useAsync } from '../../../controllers/useAsync'
import { fetchAdminResumen } from '../../../services/cuentaService'
import { formatNumero } from '../../../models/estadisticas'
import { etiquetaTipo } from '../../../models/tipos'
import ColumnChart from '../../components/dashboard/ColumnChart'
import HBarList from '../../components/dashboard/HBarList'
import ControlSimulacion from '../../components/admin/ControlSimulacion'
import ControlRafaga from '../../components/admin/ControlRafaga'
import '../../../assets/styles/dashboard.css'

const diaCorto = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })

// Completa los últimos 14 días (los días sin reportes van en 0).
function ultimos14(porDia) {
  const mapa = new Map(porDia.map((d) => [new Date(d.dia).toDateString(), d.total]))
  return Array.from({ length: 14 }, (_, i) => {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    fecha.setDate(fecha.getDate() - (13 - i))
    const total = mapa.get(fecha.toDateString()) ?? 0
    return {
      key: fecha.toISOString(),
      label: i % 2 === 1 ? '' : String(fecha.getDate()),
      value: total,
      tooltip: [diaCorto.format(fecha), `${total} reporte${total === 1 ? '' : 's'}`],
    }
  })
}

export default function AdminResumenPage() {
  const [demo, setDemo] = useState(false)
  const { data, error, cargando, recargar } = useAsync((signal) => fetchAdminResumen({ demo }, signal), [demo])
  const { suscribir } = useEventos()
  useEffect(() => suscribir((tipo) => ['reporte', 'reporte-oculto', 'reporte-moderado'].includes(tipo) && recargar()), [suscribir, recargar])

  if (error) return <div className="adm-error" role="alert">{error}</div>
  if (!data) return <p className="adm-cargando">Cargando resumen…</p>

  const e = data.porEstado
  const pendientes = e.pendiente ?? 0
  const total = (e.pendiente ?? 0) + (e.verificado ?? 0) + (e.descartado ?? 0)

  return (
    <div className={cargando ? 'adm-pagina adm-pagina--cargando' : 'adm-pagina'}>
      <div className="adm-encabezado">
        <div>
          <h1>Resumen</h1>
          <p>Estado de los reportes ciudadanos y de la comunidad.</p>
        </div>
        <label className="adm-switch">
          <input type="checkbox" checked={demo} onChange={(ev) => setDemo(ev.target.checked)} />
          Incluir datos de demostración
        </label>
      </div>

      <ControlRafaga />
      <ControlSimulacion />

      {pendientes > 0 ? (
        <div className="adm-banner">
          <strong>{pendientes} reporte{pendientes === 1 ? '' : 's'} esperando revisión.</strong>
          <span>Verificarlos a tiempo mantiene confiable el mapa de riesgo.</span>
          <Link to={`/admin/reportes?estado=pendiente${demo ? '&demo=1' : ''}`} className="adm-boton adm-boton--primario">Revisar ahora</Link>
        </div>
      ) : null}

      {/* Dos grupos que llenan su fila: estado de la moderación y uso de la plataforma. */}
      <section className="adm-kpis-grupo" aria-labelledby="kpi-moderacion">
        <h2 id="kpi-moderacion" className="adm-kpis-grupo__titulo">Moderación</h2>
        <div className="adm-kpis adm-kpis--4">
          <div className="adm-kpi adm-kpi--pendiente"><span>Pendientes</span><strong>{formatNumero(pendientes)}</strong><small>Esperan revisión</small></div>
          <div className="adm-kpi adm-kpi--verificado"><span>Verificados</span><strong>{formatNumero(e.verificado ?? 0)}</strong><small>Confirmados por el equipo</small></div>
          <div className="adm-kpi adm-kpi--descartado"><span>Descartados</span><strong>{formatNumero(e.descartado ?? 0)}</strong><small>No proceden</small></div>
          <div className="adm-kpi adm-kpi--pendiente"><span>Ocultos por la comunidad</span><strong>{data.ocultos}</strong><small>3+ marcas como falso</small></div>
        </div>
      </section>
      <section className="adm-kpis-grupo" aria-labelledby="kpi-plataforma">
        <h2 id="kpi-plataforma" className="adm-kpis-grupo__titulo">Plataforma</h2>
        <div className="adm-kpis adm-kpis--3">
          <div className="adm-kpi"><span>Total de reportes</span><strong>{formatNumero(total)}</strong><small>{demo ? 'Incluye datos de demostración' : 'Reportes ciudadanos reales'}</small></div>
          <div className="adm-kpi"><span>Usuarios</span><strong>{formatNumero(data.usuarios.total)}</strong><small>+{data.usuarios.nuevos7dias} en 7 días · {data.usuarios.admins} admin</small></div>
          <div className="adm-kpi"><span>Alertas activas</span><strong>{data.alertas.total}</strong><small>{data.alertas.altas} de nivel alto</small></div>
        </div>
      </section>

      <div className="adm-grid">
        <section className="adm-tarjeta">
          <h2>Reportes recibidos · últimos 14 días</h2>
          <ColumnChart items={ultimos14(data.porDia)} ariaLabel="Reportes por día" etiquetaValor="max" />
        </section>
        <section className="adm-tarjeta">
          <h2>Tipos más reportados · 30 días</h2>
          {data.porTipo.length ? (
            <HBarList items={data.porTipo.map((t) => ({ key: t.tipo, label: etiquetaTipo(t.tipo), value: t.total }))} ariaLabel="Reportes por tipo" compacto />
          ) : (
            <p className="adm-vacio">Sin reportes en los últimos 30 días.</p>
          )}
        </section>
      </div>
    </div>
  )
}
