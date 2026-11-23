import { Link } from 'react-router-dom'
import FondoVes from '../components/FondoVes'
import '../../assets/styles/paginas.css'

export default function NotFoundPage() {
  return (
    <section className="pagina pagina--centro pagina--perdida con-fondo-ves">
      <FondoVes variante="claro" />
      <h1>Esta calle no existe en Villa El Salvador</h1>
      <p>La dirección que buscas no está en el mapa. Volvamos a un lugar conocido.</p>
      <Link className="btn btn--primario" to="/">Volver al inicio</Link>
    </section>
  )
}
