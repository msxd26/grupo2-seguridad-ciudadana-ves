import { Link, NavLink } from 'react-router-dom'
import { NAV_LINKS } from '../../models/navigation'
import { useMenuToggle } from '../../controllers/useMenuToggle'
import Logo from './Logo'
import UserMenu from './UserMenu'
import '../../assets/styles/header.css'

const navClass = ({ isActive }) => (isActive ? 'header__link header__link--active' : 'header__link')

export default function Header() {
  const { isOpen, toggle, close } = useMenuToggle()

  return (
    <header className="header">
      <div className="header__inner container">
        <Logo />

        <button
          type="button"
          className="header__toggle"
          aria-expanded={isOpen}
          aria-controls="main-nav"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={toggle}
        >
          <span className={isOpen ? 'burger burger--open' : 'burger'} />
        </button>

        <nav
          id="main-nav"
          className={isOpen ? 'header__nav header__nav--open' : 'header__nav'}
          aria-label="Navegación principal"
        >
          <ul className="header__links">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <NavLink to={link.to} end={link.to === '/'} className={navClass} onClick={close}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link className="btn btn--alert" to="/reportar" onClick={close}>
            Reportar
          </Link>
          <UserMenu onNavegar={close} />
        </nav>
      </div>
    </header>
  )
}
