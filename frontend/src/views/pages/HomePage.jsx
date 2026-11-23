import EstadisticasSection from '../components/estadisticas/EstadisticasSection'

export default function HomePage() {
  return (
    <>
      <section className="hero container" id="inicio">
        <h1>Seguridad ciudadana en Villa El Salvador</h1>
        <p>
          Consulta las denuncias policiales oficiales del distrito, identifica las modalidades
          más frecuentes y ayuda a construir una comunidad más segura.
        </p>
      </section>
      <EstadisticasSection />
    </>
  )
}
