import { Link } from 'react-router-dom'
import { IconoChat, IconoFormulario, IconoGuiado } from '../../models/iconos'
import '../../assets/styles/reportar.css'

const MODOS = [
  {
    to: '/reportar/chat',
    Icono: IconoChat,
    titulo: 'Cuéntame qué pasó',
    texto: 'Escribe o dicta en tus palabras. La IA te ayuda a completar el reporte.',
    etiqueta: 'Recomendado',
    color: 'azul',
  },
  {
    to: '/reportar/guiado',
    Icono: IconoGuiado,
    titulo: 'Paso a paso',
    texto: 'Te hago preguntas sencillas. Solo toca botones grandes.',
    etiqueta: 'Más fácil',
    color: 'verde',
  },
  {
    to: '/reportar/formulario',
    Icono: IconoFormulario,
    titulo: 'Formulario completo',
    texto: 'Para usuarios avanzados: llena todos los campos tú mismo.',
    color: 'gris',
  },
]

// Selector de modo de reporte (plan: "¿Cómo quieres reportar?").
export default function ReportarPage() {
  return (
    <section className="reportar container">
      <header className="reportar__header">
        <h1>¿Cómo quieres reportar?</h1>
        <p>Elige la forma que te resulte más cómoda. En todas puedes reportar <strong>sin registrarte</strong>.</p>
      </header>

      <div className="aviso-emergencia" role="note">
        <strong>¿Emergencia en curso?</strong> Llama primero a la Policía al <a href="tel:105">105</a>.
      </div>

      <div className="modos">
        {MODOS.map(({ to, Icono, titulo, texto, etiqueta, color }) => (
          <Link key={to} to={to} className={`modo modo--${color}`}>
            <span className="modo__icono" aria-hidden="true"><Icono size={34} /></span>
            <span className="modo__texto">
              <strong>{titulo}</strong>
              <span>{texto}</span>
            </span>
            {etiqueta ? <span className="modo__etiqueta">{etiqueta}</span> : null}
            <span className="modo__flecha" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
