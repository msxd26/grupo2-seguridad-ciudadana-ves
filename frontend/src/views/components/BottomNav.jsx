import { NavLink } from 'react-router-dom'
import { IconoAlerta, IconoInicio, IconoMapa, IconoPin } from '../../models/iconos'

const ITEMS = [
  { to: '/', label: 'Inicio', Icono: IconoInicio, end: true },
  { to: '/mapa', label: 'Mapa', Icono: IconoMapa },
  { to: '/reportar', label: 'Reportar', Icono: IconoPin, destacado: true },
  { to: '/alertas', label: 'Alertas', Icono: IconoAlerta },
]

const clase = (destacado) => ({ isActive }) =>
  ['bottom-nav__item', destacado && 'bottom-nav__item--destacado', isActive && 'bottom-nav__item--activo'].filter(Boolean).join(' ')

// Navegación inferior para celulares (el plan pide "Reportar" siempre a un toque).
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación rápida">
      {ITEMS.map(({ to, label, Icono, end, destacado }) => (
        <NavLink key={to} to={to} end={end} className={clase(destacado)}>
          <Icono size={destacado ? 26 : 22} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
