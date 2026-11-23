import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useAsync } from '../../../controllers/useAsync'
import { actualizarUsuario, fetchAdminUsuarios } from '../../../services/cuentaService'
import { iniciales } from '../../components/UserMenu'

const fecha = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })

export default function AdminUsuariosPage() {
  const { usuario: yo } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const { data, error, recargar } = useAsync((signal) => fetchAdminUsuarios({ q }, signal), [q])
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setQ(busqueda.trim()), 400)
    return () => clearTimeout(t)
  }, [busqueda])

  const cambiar = async (u, cambios, texto) => {
    setGuardando(u.id)
    setMensaje(null)
    try {
      await actualizarUsuario(u.id, cambios)
      setMensaje({ tipo: 'ok', texto })
      recargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setGuardando(null)
    }
  }

  return (
    <div className="adm-pagina">
      <div className="adm-encabezado">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona los roles y el acceso de los vecinos registrados.</p>
        </div>
        <input className="adm-input" type="search" placeholder="Buscar por nombre o correo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar usuarios" />
      </div>

      {error ? <div className="adm-error" role="alert">{error}</div> : null}
      {mensaje ? <div className={mensaje.tipo === 'ok' ? 'adm-ok' : 'adm-error'} role="status">{mensaje.texto}</div> : null}

      <div className="adm-tabla-wrap">
        <table className="adm-tabla">
          <thead>
            <tr>
              <th scope="col">Usuario</th>
              <th scope="col">Rol</th>
              <th scope="col" className="num">Reportes</th>
              <th scope="col">Registro</th>
              <th scope="col">Último acceso</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => {
              const soyYo = u.id === yo.id
              return (
                <tr key={u.id} className={u.activo ? undefined : 'adm-tabla__fila--inactiva'}>
                  <td>
                    <div className="adm-persona">
                      <span className={u.rol === 'admin' ? 'avatar avatar--admin' : 'avatar'} aria-hidden="true">{iniciales(u.nombre)}</span>
                      <div><strong>{u.nombre}{soyYo ? ' (tú)' : ''}</strong><span>{u.email}</span></div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="adm-input adm-input--chico"
                      value={u.rol}
                      disabled={soyYo || guardando === u.id}
                      onChange={(e) => cambiar(u, { rol: e.target.value }, `${u.nombre} ahora es ${e.target.value === 'admin' ? 'administrador' : 'ciudadano'}.`)}
                      aria-label={`Rol de ${u.nombre}`}
                    >
                      <option value="ciudadano">Ciudadano</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="num">{u.reportes}</td>
                  <td className="adm-nowrap">{fecha.format(new Date(u.creadoEn))}</td>
                  <td className="adm-nowrap">{u.ultimoAcceso ? fecha.format(new Date(u.ultimoAcceso)) : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className={u.activo ? 'adm-toggle adm-toggle--on' : 'adm-toggle'}
                      disabled={soyYo || guardando === u.id}
                      aria-pressed={u.activo}
                      onClick={() => cambiar(u, { activo: !u.activo }, `Cuenta de ${u.nombre} ${u.activo ? 'desactivada' : 'activada'}.`)}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {data && !data.length ? <p className="adm-vacio">No se encontraron usuarios.</p> : null}
      </div>
    </div>
  )
}
