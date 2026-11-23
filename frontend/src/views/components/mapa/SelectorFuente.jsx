// Selector de fuente: Vecinos | Oficial | Comparar
// ODS 10: botones grandes (min-height 56px), texto ≥ 15px, iconos semánticos.
export default function SelectorFuente({ fuente, onChange }) {
  const OPCIONES = [
    { id: 'vecinal', label: 'Vecinos', icono: '🏘️', desc: 'Reportes ciudadanos' },
    { id: 'oficial', label: 'Oficial', icono: '🏛️', desc: 'Denuncias policiales' },
    { id: 'brecha', label: 'Comparar', icono: '⚖️', desc: 'Diferencia de visibilidad' },
  ]
  return (
    <div className="selector-fuente" role="group" aria-label="Fuente de datos a mostrar">
      {OPCIONES.map((op) => (
        <button
          key={op.id}
          type="button"
          className={`selector-fuente__btn${fuente === op.id ? ' selector-fuente__btn--activo' : ''}`}
          aria-pressed={fuente === op.id}
          onClick={() => onChange(op.id)}
        >
          <span className="selector-fuente__icono" aria-hidden="true">{op.icono}</span>
          <span className="selector-fuente__label">{op.label}</span>
          <span className="selector-fuente__desc">{op.desc}</span>
        </button>
      ))}
    </div>
  )
}
