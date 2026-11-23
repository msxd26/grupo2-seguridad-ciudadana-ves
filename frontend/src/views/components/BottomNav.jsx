import { NavLink } from 'react-router-dom'
import { IconoAlerta, IconoEmergencia, IconoInicio, IconoMapa, IconoPin } from '../../models/iconos'

// "Reportar" queda al centro y siempre a un toque; "SOS" deja los números de emergencia a 1 toque.
const ITEMS = [
  { to: '/', label: 'Inicio', Icono: IconoInicio, end: true },
  { to: '/mapa', label: 'Mapa', Icono: IconoMapa },
  { to: '/reportar', label: 'Reportar', Icono: IconoPin, destacado: true },
  { to: '/alertas', label: 'Alertas', Icono: IconoAlerta },
  { to: '/contacto', label: 'SOS', Icono: IconoEmergencia, sos: true },
]

const clase = (destacado, sos) => ({ isActive }) =>
  ['bottom-nav__item', destacado && 'bottom-nav__item--destacado', sos && 'bottom-nav__item--sos', isActive && 'bottom-nav__item--activo'].filter(Boolean).join(' ')

// Navegación inferior para celulares. NavLink marca el ítem activo con aria-current="page".
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación rápida">
      {ITEMS.map(({ to, label, Icono, end, destacado, sos }) => (
        <NavLink key={to} to={to} end={end} className={clase(destacado, sos)}>
          <Icono size={destacado ? 26 : 22} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
