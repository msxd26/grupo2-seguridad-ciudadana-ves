import { useState } from 'react'
import { useElementWidth } from '../../../controllers/useElementWidth'
import { MESES, MESES_CORTOS, formatNumero } from '../../../models/estadisticas'
import { niceTicks, tickFormatter } from './chartUtils'

const H = 240
const M = { top: 20, right: 16, bottom: 28, left: 44 }
const PLOT_H = H - M.top - M.bottom

const toPoints = (serie, x, y) => serie.map((d) => `${x(d.mes)},${y(d.total)}`).join(' ')

// Línea mensual del año seleccionado frente al año anterior (mismo eje).
export default function MonthlyChart({ anio, actual, anterior }) {
  const [hoverMes, setHoverMes] = useState(null)
  const [plotRef, W] = useElementWidth(480)
  const PLOT_W = W - M.left - M.right
  const x = (mes) => M.left + ((mes - 1) / 11) * PLOT_W
  // En pantallas angostas se muestra un mes sí y otro no.
  const pasoMes = PLOT_W / 11 < 30 ? 2 : 1

  const { max, ticks } = niceTicks(Math.max(...actual.map((d) => d.total), ...anterior.map((d) => d.total)))
  const fmt = tickFormatter(max)
  const y = (v) => M.top + PLOT_H - (v / max) * PLOT_H

  const ultimo = actual.at(-1)
  const valorActual = actual.find((d) => d.mes === hoverMes)
  const valorAnterior = anterior.find((d) => d.mes === hoverMes)

  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * W
    const mes = Math.round(((px - M.left) / PLOT_W) * 11) + 1
    setHoverMes(Math.min(12, Math.max(1, mes)))
  }

  return (
    <div className="chart">
      <ul className="chart__legend">
        <li><span className="chart__key chart__key--actual" />{anio}</li>
        {anterior.length > 0 ? <li><span className="chart__key chart__key--anterior" />{anio - 1}</li> : null}
      </ul>
      <div className="chart__plot" ref={plotRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Denuncias por mes en ${anio} comparadas con ${anio - 1}`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverMes(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {fmt(t)}
              </text>
            </g>
          ))}
          {MESES_CORTOS.map((m, i) =>
            i % pasoMes === 0 ? (
              <text key={m} className="chart__tick" x={x(i + 1)} y={H - 8} textAnchor="middle">
                {m}
              </text>
            ) : null,
          )}

          {hoverMes !== null ? (
            <line className="chart__crosshair" x1={x(hoverMes)} x2={x(hoverMes)} y1={M.top} y2={M.top + PLOT_H} />
          ) : null}

          {anterior.length > 0 ? <polyline className="chart__line chart__line--anterior" points={toPoints(anterior, x, y)} /> : null}
          <polyline className="chart__line chart__line--actual" points={toPoints(actual, x, y)} />

          {ultimo ? <circle className="chart__dot" cx={x(ultimo.mes)} cy={y(ultimo.total)} r="4.5" /> : null}
          {valorActual ? <circle className="chart__dot" cx={x(hoverMes)} cy={y(valorActual.total)} r="4.5" /> : null}
        </svg>

        {hoverMes !== null && (valorActual || valorAnterior) ? (
          <div
            className="chart__tooltip"
            style={{ left: `${(x(hoverMes) / W) * 100}%`, top: `${(M.top / H) * 100}%` }}
          >
            <strong>{MESES[hoverMes - 1]}</strong>
            {valorActual ? <span><i className="chart__key chart__key--actual" />{anio}: {formatNumero(valorActual.total)}</span> : null}
            {valorAnterior ? <span><i className="chart__key chart__key--anterior" />{anio - 1}: {formatNumero(valorAnterior.total)}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
