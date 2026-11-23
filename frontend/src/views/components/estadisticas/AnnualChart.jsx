import { useState } from 'react'
import { useElementWidth } from '../../../controllers/useElementWidth'
import { formatNumero, periodoCorto } from '../../../models/estadisticas'
import { columnPath, niceTicks, tickFormatter } from './chartUtils'

const H = 260
const M = { top: 24, right: 8, bottom: 28, left: 44 }
const PLOT_H = H - M.top - M.bottom

// Columnas por año. El año seleccionado va en el color principal; clic para seleccionar.
export default function AnnualChart({ data, anioSeleccionado, onSelect }) {
  const [hover, setHover] = useState(null)
  const [plotRef, W] = useElementWidth()
  const PLOT_W = W - M.left - M.right
  const compacto = W < 480 // en pantallas angostas los años van abreviados ('18)

  const { max, ticks } = niceTicks(Math.max(...data.map((d) => d.total)))
  const fmt = tickFormatter(max)
  const band = PLOT_W / data.length
  const barW = Math.min(24, band * 0.6)
  const y = (v) => M.top + PLOT_H - (v / max) * PLOT_H

  const hovered = hover === null ? null : data[hover]

  return (
    <div className="chart">
      <div className="chart__plot" ref={plotRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Denuncias registradas por año en Villa El Salvador">
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {fmt(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = M.left + band * i + band / 2
            const top = y(d.total)
            const selected = d.anio === anioSeleccionado
            return (
              <g key={d.anio}>
                <path
                  className={selected ? 'chart__col chart__col--active' : 'chart__col'}
                  d={columnPath(cx - barW / 2, top, barW, M.top + PLOT_H - top)}
                />
                {selected ? (
                  <text className="chart__value" x={cx} y={top - 8} textAnchor="middle">
                    {formatNumero(d.total)}
                  </text>
                ) : null}
                <text className="chart__tick" x={cx} y={H - 8} textAnchor="middle">
                  {compacto ? `'${String(d.anio).slice(2)}` : d.anio}
                  {d.completo ? '' : '*'}
                </text>
                {/* Zona de interacción más grande que la columna */}
                <rect
                  className="chart__hit"
                  x={M.left + band * i}
                  y={M.top}
                  width={band}
                  height={PLOT_H + M.bottom}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelect(d.anio)}
                />
              </g>
            )
          })}
        </svg>

        {hovered ? (
          <div
            className="chart__tooltip"
            style={{ left: `${((M.left + band * hover + band / 2) / W) * 100}%`, top: `${(y(hovered.total) / H) * 100}%` }}
          >
            <strong>{hovered.anio}</strong>
            <span>{formatNumero(hovered.total)} denuncias</span>
            <span className="chart__tooltip-muted">{periodoCorto(hovered.ultimoMes)}</span>
          </div>
        ) : null}
      </div>
      <p className="chart__note">* Año en curso, datos parciales. Haz clic en una columna para ver el detalle del año.</p>
    </div>
  )
}
