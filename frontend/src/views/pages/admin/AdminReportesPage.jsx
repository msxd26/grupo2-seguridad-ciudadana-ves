import { useEffect, useState } from 'react'
import { useAsync } from '../../../controllers/useAsync'
import { useAdminReportes } from '../../../controllers/useAdminReportes'
import { fetchTiposReporte } from '../../../services/seguridadService'
import { ESTADOS_REPORTE } from '../../../models/reportes'
import DetalleReporte from '../../components/admin/DetalleReporte'

const fechaCorta = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const PESTANAS = [
  { id: '', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'verificado', label: 'Verificados' },
  { id: 'descartado', label: 'Descartados' },
]

export default function AdminReportesPage() {
  const { filtros, data, error, cargando, setFiltro, seleccionado, setSeleccionado, moderar } = useAdminReportes()
  const tipos = useAsync((signal) => fetchTiposReporte(signal), [])
  const [busqueda, setBusqueda] = useState(filtros.q)

  // Búsqueda con pequeña espera para no consultar en cada tecla.
  useEffect(() => {
    if (busqueda === filtros.q) return
    const t = setTimeout(() => setFiltro('q', busqueda.trim()), 400)
    return () => clearTimeout(t)
  }, [busqueda, filtros.q, setFiltro])

  return (
    <div className="adm-pagina">
      <div className="adm-encabezado">
        <div>
          <h1>Moderación de reportes</h1>
          <p>Verifica o descarta los reportes ciudadanos. El autor verá el estado y tu comentario.</p>
        </div>
      </div>

      <div className="adm-filtros">
        <div className="adm-tabs" role="tablist">
          {PESTANAS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={filtros.estado === p.id} className={filtros.estado === p.id ? 'activo' : undefined} onClick={() => setFiltro('estado', p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <input className="adm-input" type="search" placeholder="Buscar por texto, autor o N.º" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar" />
        <select className="adm-input" value={filtros.tipo} onChange={(e) => setFiltro('tipo', e.target.value)} aria-label="Tipo">
          <option value="">Todos los tipos</option>
          {(tipos.data ?? []).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="adm-switch">
          <input type="checkbox" checked={filtros.demo} onChange={(e) => setFiltro('demo', e.target.checked)} /> Incluir demo
        </label>
      </div>

      {error ? <div className="adm-error" role="alert">{error}</div> : null}

      <div className={cargando ? 'adm-tabla-wrap adm-pagina--cargando' : 'adm-tabla-wrap'}>
        <table className="adm-tabla">
          <thead>
            <tr>
              <th scope="col">N.º</th>
              <th scope="col">Tipo</th>
              <th scope="col">Descripción</th>
              <th scope="col">Autor</th>
              <th scope="col">Fecha del hecho</th>
              <th scope="col">Estado</th>
              <th scope="col"><span className="sr-only">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {(data?.reportes ?? []).map((r) => (
              <tr key={r.id} className={seleccionado?.id === r.id ? 'adm-tabla__fila--activa' : undefined}>
                <td className="adm-mono">#{r.id}</td>
                <td>{r.tipo}{r.esDemo ? <span className="badge-demo">DEMO</span> : null}</td>
                <td className="adm-tabla__desc">{r.descripcion}</td>
                <td>{r.autor ? r.autor.nombre : <span className="adm-muted">Anónimo</span>}</td>
                <td className="adm-nowrap">{fechaCorta.format(new Date(r.fechaHecho))}</td>
                <td><span className={`adm-estado adm-estado--${r.estado}`}>{ESTADOS_REPORTE[r.estado].label}</span></td>
                <td><button type="button" className="adm-boton adm-boton--chico" onClick={() => setSeleccionado(r)}>Revisar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.reportes.length ? <p className="adm-vacio">No hay reportes con estos filtros.</p> : null}
      </div>

      {data && data.paginas > 1 ? (
        <div className="adm-paginacion">
          <button type="button" className="adm-boton" disabled={data.pagina <= 1} onClick={() => setFiltro('pagina', data.pagina - 1)}>← Anterior</button>
          <span>Página {data.pagina} de {data.paginas} · {data.total} reportes</span>
          <button type="button" className="adm-boton" disabled={data.pagina >= data.paginas} onClick={() => setFiltro('pagina', data.pagina + 1)}>Siguiente →</button>
        </div>
      ) : data ? <p className="adm-muted adm-total">{data.total} reporte{data.total === 1 ? '' : 's'}</p> : null}

      {seleccionado ? (
        <DetalleReporte key={seleccionado.id} reporte={seleccionado} onCerrar={() => setSeleccionado(null)} onModerar={moderar} />
      ) : null}
    </div>
  )
}
