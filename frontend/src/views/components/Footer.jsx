import { EMERGENCY_NUMBERS, FOOTER_LINKS, NAV_LINKS } from '../../models/navigation'
import Logo from './Logo'
import '../../assets/styles/footer.css'

// Valor calculado una sola vez al cargar el módulo.
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer__grid container">
        <section className="footer__brand">
          <Logo />
          <p>
            Sistema digital de alertas ciudadanas y monitoreo de la delincuencia
            en Villa El Salvador. Reporta, informa y ayuda a construir un distrito
            más seguro.
          </p>
        </section>

        <section>
          <h2 className="footer__title">Navegación</h2>
          <ul className="footer__list">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="footer__title">Emergencias</h2>
          <ul className="footer__list footer__emergency">
            {EMERGENCY_NUMBERS.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <a className="footer__phone" href={`tel:${item.number}`}>
                  {item.number}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="footer__title">Información</h2>
          <ul className="footer__list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="footer__bottom">
        <div className="container">
          © {CURRENT_YEAR} Alerta VES · Grupo 2 — Seguridad Ciudadana Villa El Salvador
        </div>
      </div>
    </footer>
  )
}
