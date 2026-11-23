import { Link } from 'react-router-dom'
import '../../assets/styles/paginas.css'

export default function NotFoundPage() {
  return (
    <section className="pagina container pagina--centro">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe.</p>
      <Link className="btn btn--primario" to="/">Volver al inicio</Link>
    </section>
  )
}
