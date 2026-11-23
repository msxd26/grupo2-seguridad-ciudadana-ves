import { Link } from 'react-router-dom'

// SVG estático elevado a nivel de módulo (rendering-hoist-jsx).
const shieldIcon = (
  <svg className="logo__icon" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" fill="currentColor" />
    <path d="M12 7v6M12 16v.5" stroke="#0f1b2d" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

export default function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Tu Vecino, ir al inicio">
      {shieldIcon}
      <span className="logo__text">
        Tu <strong>Vecino</strong>
      </span>
    </Link>
  )
}
