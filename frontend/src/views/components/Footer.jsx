import { Link } from 'react-router-dom'
import { EMERGENCY_NUMBERS, FOOTER_LINKS, FUENTES } from '../../models/navigation'
import Logo from './Logo'
import FondoVes from './FondoVes'
import '../../assets/styles/footer.css'

// Valor calculado una sola vez al cargar el módulo.
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer con-fondo-ves">
      <FondoVes variante="oscuro" costa={false} puntos={false} />
      <div className="footer__grid container">
        <section className="footer__brand">
          <Logo />
          <p>
            Haciendo visible la inseguridad que no se denuncia. Reportes vecinales en tiempo real y datos
            oficiales para que Villa El Salvador decida mejor.
          </p>
        </section>

        <section>
          <h2 className="footer__title">Navegación</h2>
          <ul className="footer__list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.id}>
                <Link to={link.to}>{link.label}</Link>
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
          <h2 className="footer__title">Fuentes de datos</h2>
          <ul className="footer__list">
            {FUENTES.map((f) => (
              <li key={f.id}>
                <a href={f.href} target="_blank" rel="noreferrer">
                  {f.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="footer__bottom">
        <div className="container">
          © {CURRENT_YEAR} Tu Vecino · Grupo 2 — HackODS UA 2026 · ODS 5 y ODS 10 · Villa El Salvador, Ciudad Mensajera de la Paz
        </div>
      </div>
    </footer>
  )
}
