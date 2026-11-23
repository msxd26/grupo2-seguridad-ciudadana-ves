import { NavLink } from 'react-router-dom'
import { IconoAlerta, IconoInicio, IconoMapa, IconoPanel, IconoPin } from '../../models/iconos'

// "Reportar" queda al centro y siempre a un toque; el panel municipal también, para la demo con el jurado.
const ITEMS = [
  { to: '/', label: 'Inicio', Icono: IconoInicio, end: true },
  { to: '/mapa', label: 'Mapa', Icono: IconoMapa },
  { to: '/reportar', label: 'Reportar', Icono: IconoPin, destacado: true },
  { to: '/alertas', label: 'Alertas', Icono: IconoAlerta },
  { to: '/dashboard', label: 'Panel', Icono: IconoPanel },
]

const clase = (destacado) => ({ isActive }) =>
  ['bottom-nav__item', destacado && 'bottom-nav__item--destacado', isActive && 'bottom-nav__item--activo'].filter(Boolean).join(' ')

// Navegación inferior para celulares. NavLink marca el ítem activo con aria-current="page".
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
