import { NAV_LINKS } from '../../models/navigation'
import { useMenuToggle } from '../../controllers/useMenuToggle'
import Logo from './Logo'
import '../../assets/styles/header.css'

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
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn--alert" href="#reportar" onClick={close}>
            Reportar ahora
          </a>
        </nav>
      </div>
    </header>
  )
}
