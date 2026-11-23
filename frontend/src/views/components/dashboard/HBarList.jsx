import { formatNumero } from '../../../models/estadisticas'

// Barras horizontales clicables (filtro cruzado).
// item: { key, label, value, extra, activo, atenuado, destacado, title }
export default function HBarList({ items, onSelect, ariaLabel, prefijo, compacto = false }) {
  const max = Math.max(...items.map((d) => d.value), 1)

  return (
    <ul className={compacto ? "hbars hbars--compacto" : "hbars"} aria-label={ariaLabel}>
      {items.map((d) => {
        const clase = [
          'hbars__row',
          d.activo && 'hbars__row--activo',
          d.atenuado && 'hbars__row--atenuado',
          d.destacado && 'hbars__row--destacado',
        ].filter(Boolean).join(' ')
        const contenido = (
          <>
            <span className="hbars__label">
              {prefijo ? <span className="hbars__prefijo">{prefijo(d)}</span> : null}
              {d.label}
            </span>
            <span className="hbars__track">
              <span className="hbars__fill" style={{ width: `calc((100% - 7.5rem) * ${d.value / max})` }} />
              <span className="hbars__value">
                {formatNumero(d.value)}
                {d.extra ? <span className="hbars__extra"> {d.extra}</span> : null}
              </span>
            </span>
          </>
        )
        return (
          <li key={d.key}>
            {onSelect ? (
              <button type="button" className={clase} onClick={() => onSelect(d.key)} aria-pressed={Boolean(d.activo)} title={d.title}>
                {contenido}
              </button>
            ) : (
              <div className={clase} title={d.title}>{contenido}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
