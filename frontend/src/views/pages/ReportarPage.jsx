import { Link } from 'react-router-dom'
import { IconoChat, IconoFormulario, IconoGuiado } from '../../models/iconos'
import '../../assets/styles/reportar.css'

// 1 modo recomendado (grande) + 2 alternativas: menos fricción que 3 opciones equivalentes (Ley de Hick).
const MODOS = [
  {
    to: '/reportar/chat',
    Icono: IconoChat,
    titulo: 'Cuéntame qué pasó',
    texto: 'Escribe o dicta en tus palabras. La IA te ayuda y tú corriges si hace falta.',
    etiqueta: '⭐ Recomendado',
    color: 'azul',
    principal: true,
  },
  {
    to: '/reportar/guiado',
    Icono: IconoGuiado,
    titulo: 'Paso a paso',
    texto: 'Preguntas sencillas con botones grandes, sin escribir.',
    etiqueta: 'Más fácil',
    color: 'verde',
  },
  {
    to: '/reportar/formulario',
    Icono: IconoFormulario,
    titulo: 'Formulario completo',
    texto: 'Llena tú los campos.',
    color: 'gris',
  },
]

// Selector de modo de reporte (plan: "¿Cómo quieres reportar?").
export default function ReportarPage() {
  return (
    <section className="reportar container">
      {/* La confianza va primero: es lo que decide si una víctima de acoso reporta (ODS 5). */}
      <div className="aviso-anonimo" role="note">
        <span className="aviso-anonimo__icono" aria-hidden="true">🔒</span>
        <div>
          <strong>Sin registro · Sin DNI · Anónimo</strong>
          <span>Tu nombre nunca aparece en el mapa ni lo ven otros vecinos.</span>
        </div>
      </div>

      <header className="reportar__header">
        <h1>¿Cómo quieres reportar?</h1>
        <p>Solo toma 60 segundos. Nadie sabrá que fuiste tú.</p>
      </header>

      <div className="modos">
        {MODOS.map(({ to, Icono, titulo, texto, etiqueta, color, principal }) => (
          <Link key={to} to={to} className={`modo modo--${color}${principal ? ' modo--principal' : ''}`}>
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

      <p className="emergencia-inline">
        <span aria-hidden="true">⚠️</span> ¿Emergencia en curso? Llama primero a la Policía al <a href="tel:105">105</a>.
      </p>
    </section>
  )
}
