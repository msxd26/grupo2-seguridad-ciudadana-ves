import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { iniciales } from '../components/UserMenu'
import '../../assets/styles/admin.css'

const MENU = [
  { to: '/admin', label: 'Resumen', icono: '▦', end: true },
  { to: '/admin/reportes', label: 'Moderación de reportes', icono: '☰' },
  { to: '/admin/usuarios', label: 'Usuarios', icono: '◉' },
]
const ENLACES = [
  { to: '/dashboard', label: 'Panel de decisión' },
  { to: '/mapa', label: 'Mapa de riesgo' },
  { to: '/alertas', label: 'Alertas públicas' },
]

const cargando = <p className="adm-cargando">Cargando…</p>
const claseNav = ({ isActive }) => (isActive ? 'adm-nav__link adm-nav__link--activo' : 'adm-nav__link')

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  const salir = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="adm">
      <aside className={abierto ? 'adm-sidebar adm-sidebar--abierto' : 'adm-sidebar'}>
        <Link to="/admin" className="adm-marca" onClick={() => setAbierto(false)}>
          <span className="adm-marca__escudo" aria-hidden="true">◆</span>
          <span>Alerta VES <small>Administración</small></span>
        </Link>

        <nav className="adm-nav" aria-label="Administración">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={claseNav} onClick={() => setAbierto(false)}>
              <span aria-hidden="true">{m.icono}</span>{m.label}
            </NavLink>
          ))}
          <span className="adm-nav__titulo">Sitio público</span>
          {ENLACES.map((m) => (
            <Link key={m.to} to={m.to} className="adm-nav__link adm-nav__link--secundario">{m.label} ↗</Link>
          ))}
        </nav>

        <div className="adm-usuario">
          <span className="avatar avatar--admin" aria-hidden="true">{iniciales(usuario.nombre)}</span>
          <div>
            <strong>{usuario.nombre}</strong>
            <span>{usuario.email}</span>
          </div>
          <button type="button" onClick={salir} title="Cerrar sesión">Salir</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-topbar__menu" onClick={() => setAbierto((v) => !v)} aria-label="Abrir menú">☰</button>
          <span className="adm-topbar__titulo">Panel de administración</span>
          <Link to="/" className="adm-topbar__sitio">Ir al sitio →</Link>
        </header>
        <main className="adm-contenido">
          <Suspense fallback={cargando}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {abierto ? <button type="button" className="adm-velo" aria-label="Cerrar menú" onClick={() => setAbierto(false)} /> : null}
    </div>
  )
}
