import { useState } from 'react'
import { useElementWidth } from '../../../controllers/useElementWidth'
import { MESES, formatNumero } from '../../../models/estadisticas'
import { niceTicks, tickFormatter } from '../charts/chartUtils'

const H = 250
const M = { top: 16, right: 16, bottom: 26, left: 44 }
const PLOT_H = H - M.top - M.bottom

// Denuncias por mes + promedio móvil de 3 meses (misma escala, un solo eje).
export default function TrendChart({ serie }) {
  const [hover, setHover] = useState(null)
  const [ref, W] = useElementWidth(700)
  const plotW = W - M.left - M.right
  const n = serie.length

  const { max, ticks } = niceTicks(Math.max(...serie.map((p) => p.total), 1))
  const fmt = tickFormatter(max)
  const x = (i) => M.left + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2)
  const y = (v) => M.top + PLOT_H - (v / max) * PLOT_H

  const linea = serie.map((p, i) => `${x(i)},${y(p.total)}`).join(' ')
  const tendencia = serie
    .map((p, i) => (p.promedioMovil === null ? null : `${x(i)},${y(p.promedioMovil)}`))
    .filter(Boolean)
    .join(' ')
  const area = `${M.left},${y(0)} ${linea} ${x(n - 1)},${y(0)}`

  // Etiquetas del eje X: enero de cada año (o cada 2 años si no entran).
  const enero = serie.map((p, i) => ({ ...p, i })).filter((p) => p.mes === 1 || p.i === 0)
  const paso = enero.length * 48 > plotW ? 2 : 1

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - M.left) / plotW) * (n - 1))
    setHover(Math.min(n - 1, Math.max(0, i)))
  }

  const p = hover === null ? null : serie[hover]
  const ultimo = serie.at(-1)

  return (
    <div className="chart">
      <ul className="chart__legend">
        <li><span className="chart__key chart__key--s1" />Denuncias por mes</li>
        <li><span className="chart__key chart__key--s2" />Tendencia (promedio móvil 3 meses)</li>
      </ul>
      <div className="chart__plot" ref={ref}>
        <svg width={W} height={H} role="img" aria-label="Tendencia mensual de denuncias" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{fmt(t)}</text>
            </g>
          ))}
          {enero.filter((_, k) => k % paso === 0).map((q) => (
            <text key={q.i} className="chart__tick" x={x(q.i)} y={H - 6} textAnchor="middle">{q.anio}</text>
          ))}
          <polygon className="chart__area" points={area} />
          <polyline className="chart__line chart__line--s1" points={linea} />
          {tendencia ? <polyline className="chart__line chart__line--s2" points={tendencia} /> : null}
          {p ? <line className="chart__crosshair" x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + PLOT_H} /> : null}
          {ultimo ? <circle className="chart__dot" cx={x(n - 1)} cy={y(ultimo.total)} r="4.5" /> : null}
          {p ? <circle className="chart__dot" cx={x(hover)} cy={y(p.total)} r="4.5" /> : null}
        </svg>
        {p ? (
          <div className="chart__tooltip" style={{ left: x(hover), top: M.top }}>
            <strong>{MESES[p.mes - 1]} {p.anio}</strong>
            <span><i className="chart__key chart__key--s1" />{formatNumero(p.total)} denuncias</span>
            {p.promedioMovil !== null ? (
              <span><i className="chart__key chart__key--s2" />Tendencia: {formatNumero(p.promedioMovil)}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
