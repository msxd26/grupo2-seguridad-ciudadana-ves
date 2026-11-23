import { useState } from 'react'
import { Link } from 'react-router-dom'

const CLAVE = 'tv-bienvenida'

const yaLoVio = () => {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

// Onboarding de 1 pantalla: solo la primera visita (ODS 10, inclusión digital).
export default function BannerBienvenida() {
  const [visible, setVisible] = useState(() => !yaLoVio())
  if (!visible) return null

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {
      // Sin almacenamiento (modo privado): solo se oculta en esta visita.
    }
    setVisible(false)
  }

  return (
    <section className="bienvenida container" aria-labelledby="bienvenida-titulo">
      <span className="bienvenida__emoji" aria-hidden="true">👋</span>
      <div className="bienvenida__texto">
        <h2 id="bienvenida-titulo">Bienvenido/a a Tu Vecino</h2>
        <p>Puedes reportar un incidente en 60 segundos, sin registrarte y de forma totalmente anónima.</p>
      </div>
      <div className="bienvenida__acciones">
        <Link className="btn btn--primario" to="/reportar" onClick={cerrar}>Reportar ahora →</Link>
        <button type="button" className="btn btn--fantasma" onClick={cerrar}>Ya entendí</button>
      </div>
    </section>
  )
}
