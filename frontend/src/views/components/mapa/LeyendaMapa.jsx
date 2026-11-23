import { useState } from 'react'
import { TIPOS } from '../../../models/tipos'

// Dos grupos: lo peligroso primero, lo informativo después (jerarquía visual).
const PELIGRO = new Set(['robo', 'intento_robo', 'acoso'])
const GRUPOS = [
  { id: 'peligro', titulo: 'Incidentes (peligro)', tipos: TIPOS.filter((t) => PELIGRO.has(t.id)) },
  { id: 'otros', titulo: 'Otros', tipos: TIPOS.filter((t) => !PELIGRO.has(t.id)) },
]

// Escala divergente de brecha (mismos valores que CapaBrecha.jsx).
const NIVELES_BRECHA = [
  { nivel: 'alta',           simbolo: '▲', label: 'Vecinos reportan mucho más',   color: '#DC2626', bg: '#FEE2E2' },
  { nivel: 'media',          simbolo: '■', label: 'Vecinos reportan más',          color: '#C2410C', bg: '#FEF3C7' },
  { nivel: 'similar',        simbolo: '—', label: 'Similar en ambas fuentes',      color: '#94A3B8', bg: '#F1F5F9' },
  { nivel: 'sin_equivalente',simbolo: '✕', label: 'Sin registro oficial',          color: '#7C3AED', bg: '#EDE9FE' },
]

// Leyenda flotante sobre el mapa.
// `modoBrecha`: muestra la escala divergente en lugar de los tipos de incidente.
export default function LeyendaMapa({ modoBrecha = false }) {
  const [abierta, setAbierta] = useState(false)
  return (
    <div className={abierta ? 'leyenda-mapa' : 'leyenda-mapa leyenda-mapa--cerrada'}>
      <button
        type="button"
        className="leyenda-mapa__titulo"
        aria-expanded={abierta}
        aria-controls="leyenda-mapa-lista"
        onClick={() => setAbierta((a) => !a)}
      >
        Leyenda <span aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>

      {abierta ? (
        <div id="leyenda-mapa-lista">
          {modoBrecha ? (
            /* Escala de brecha: nunca solo color (WCAG 1.4.1) */
            <div className="leyenda-mapa__grupo">
              <span className="leyenda-mapa__subtitulo">Diferencia de visibilidad</span>
              <ul className="leyenda-mapa__lista">
                {NIVELES_BRECHA.map(({ nivel, simbolo, label, color, bg }) => (
                  <li key={nivel}>
                    <span
                      className="leyenda-brecha__punto"
                      style={{ color, background: bg, borderColor: color }}
                      aria-hidden="true"
                    >
                      {simbolo}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              <p className="leyenda-mapa__nota">Oficial: estimación proporcional sobre datos SIDPOL por distrito.</p>
            </div>
          ) : (
            GRUPOS.map((g) => (
              <div key={g.id} className={`leyenda-mapa__grupo leyenda-mapa__grupo--${g.id}`}>
                <span className="leyenda-mapa__subtitulo">{g.titulo}</span>
                <ul className="leyenda-mapa__lista">
                  {g.tipos.map(({ id, label, color, Icono }) => (
                    <li key={id}>
                      <span className="leyenda-mapa__icono" style={{ '--color-tipo': color }} aria-hidden="true">
                        <Icono size={14} />
                      </span>
                      {label}
                    </li>
                  ))}
                  {g.id === 'otros' ? <li><i className="leyenda__seguro" aria-hidden="true" /> Punto seguro (comisaría)</li> : null}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
