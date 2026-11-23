import { useState } from 'react'
import { useElementWidth } from '../../../controllers/useElementWidth'
import { formatNumero } from '../../../models/estadisticas'
import { columnPath, niceTicks, tickFormatter } from '../charts/chartUtils'

const H = 220
const M = { top: 22, right: 8, bottom: 26, left: 44 }
const PLOT_H = H - M.top - M.bottom

// Columnas clicables (filtro cruzado). item: { key, label, value, tooltip: [líneas], activo, atenuado }
export default function ColumnChart({ items, onSelect, ariaLabel, etiquetaValor = 'activo' }) {
  const [hover, setHover] = useState(null)
  const [ref, W] = useElementWidth(420)
  const plotW = W - M.left - M.right
  const band = plotW / Math.max(items.length, 1)
  const barW = Math.min(24, band * 0.6)

  const { max, ticks } = niceTicks(Math.max(...items.map((d) => d.value), 1))
  const fmt = tickFormatter(max)
  const y = (v) => M.top + PLOT_H - (v / max) * PLOT_H
  const maxValor = Math.max(...items.map((d) => d.value))

  const h = hover === null ? null : items[hover]

  return (
    <div className="chart">
      <div className="chart__plot" ref={ref}>
        <svg width={W} height={H} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{fmt(t)}</text>
            </g>
          ))}
          {items.map((d, i) => {
            const cx = M.left + band * i + band / 2
            const top = y(d.value)
            const mostrarValor = etiquetaValor === 'activo' ? d.activo : d.value === maxValor
            const clase = d.activo ? 'chart__col chart__col--activo' : d.atenuado ? 'chart__col chart__col--atenuado' : 'chart__col'
            return (
              <g key={d.key}>
                <path className={clase} d={columnPath(cx - barW / 2, top, barW, Math.max(M.top + PLOT_H - top, 0))} />
                {mostrarValor ? (
                  <text className="chart__value" x={cx} y={top - 7} textAnchor="middle">{formatNumero(d.value)}</text>
                ) : null}
                <text className="chart__tick" x={cx} y={H - 6} textAnchor="middle">
                  {band < 40 && d.labelCorto ? d.labelCorto : d.label}
                </text>
                <rect
                  className={onSelect ? 'chart__hit chart__hit--click' : 'chart__hit'}
                  x={M.left + band * i}
                  y={M.top}
                  width={band}
                  height={PLOT_H + M.bottom}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onClick={onSelect ? () => onSelect(d.key) : undefined}
                />
              </g>
            )
          })}
        </svg>
        {h ? (
          <div className="chart__tooltip" style={{ left: M.left + band * hover + band / 2, top: y(h.value) }}>
            {h.tooltip.map((linea, k) => (k === 0 ? <strong key={k}>{linea}</strong> : <span key={k}>{linea}</span>))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
