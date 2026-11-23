import { useState } from 'react'
import { useElementWidth } from '../../../controllers/useElementWidth'
import { niceTicks, tickFormatter } from '../charts/chartUtils'

const H = 240
const M = { top: 20, right: 12, bottom: 28, left: 40 }
const PLOT_H = H - M.top - M.bottom
const fechaCorta = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const etiqueta = (iso) => fechaCorta.format(new Date(`${iso}T00:00:00Z`))

// Reportes por semana: histórico (línea continua) + proyección (línea punteada) con banda de incertidumbre.
// Una sola escala; la banda es el rango probable (80 %), no un número exacto.
export default function GraficoProyeccion({ historico, proyeccion }) {
  const [ref, W] = useElementWidth(520)
  const [hover, setHover] = useState(null)
  const puntos = [
    ...historico.map((h) => ({ semana: h.semana, valor: h.total, tipo: 'historico' })),
    ...proyeccion.map((p) => ({ semana: p.semana, valor: p.esperado, min: p.min, max: p.max, tipo: 'proyeccion' })),
  ]
  const plotW = W - M.left - M.right
  const paso = plotW / Math.max(puntos.length - 1, 1)
  const { max, ticks } = niceTicks(Math.max(...puntos.map((p) => p.max ?? p.valor), 1))
  const fmt = tickFormatter(max)
  const x = (i) => M.left + paso * i
  const y = (v) => M.top + PLOT_H - (v / max) * PLOT_H

  const iHoy = historico.length - 1
  const linea = (desde, hasta) => puntos.slice(desde, hasta + 1).map((p, k) => `${k ? 'L' : 'M'}${x(desde + k)},${y(p.valor)}`).join('')
  // La banda nace en el último dato real (sin incertidumbre) y se abre en las semanas proyectadas.
  const banda = [
    `M${x(iHoy)},${y(puntos[iHoy].valor)}`,
    ...proyeccion.map((p, k) => `L${x(iHoy + 1 + k)},${y(p.max)}`),
    ...proyeccion.map((p, k) => `L${x(iHoy + proyeccion.length - k)},${y(proyeccion[proyeccion.length - 1 - k].min)}`),
    'Z',
  ].join('')
  const h = hover === null ? null : puntos[hover]
  const cadaCuanto = paso < 46 ? 2 : 1

  return (
    <div className="chart proyeccion">
      <ul className="proyeccion__leyenda" aria-label="Leyenda">
        <li><span className="proyeccion__muestra proyeccion__muestra--historico" aria-hidden="true" /> Reportes por semana</li>
        <li><span className="proyeccion__muestra proyeccion__muestra--proyeccion" aria-hidden="true" /> Proyección</li>
        <li><span className="proyeccion__muestra proyeccion__muestra--banda" aria-hidden="true" /> Rango probable (80 %)</li>
      </ul>
      <div className="chart__plot" ref={ref}>
        <svg width={W} height={H} role="img" aria-label={`Reportes por semana en el distrito y proyección de las próximas ${proyeccion.length} semanas con su rango probable`}>
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{fmt(t)}</text>
            </g>
          ))}
          <path className="proyeccion__banda" d={banda} />
          <line className="proyeccion__hoy" x1={x(iHoy)} x2={x(iHoy)} y1={M.top - 6} y2={M.top + PLOT_H} />
          <text className="proyeccion__hoy-texto" x={x(iHoy) + 4} y={M.top - 8}>Hoy</text>
          <path className="proyeccion__linea" d={linea(0, iHoy)} />
          <path className="proyeccion__linea proyeccion__linea--futura" d={linea(iHoy, puntos.length - 1)} />
          {puntos.map((p, i) => (
            <g key={p.semana}>
              <circle className={p.tipo === 'historico' ? 'proyeccion__punto' : 'proyeccion__punto proyeccion__punto--futuro'} cx={x(i)} cy={y(p.valor)} r={hover === i ? 5.5 : 4} />
              {i % cadaCuanto === 0 || i === puntos.length - 1 ? (
                <text className="chart__tick" x={x(i)} y={H - 8} textAnchor="middle">{etiqueta(p.semana)}</text>
              ) : null}
              <rect
                className="chart__hit"
                x={x(i) - paso / 2}
                y={M.top}
                width={paso}
                height={PLOT_H}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          ))}
        </svg>
        {h ? (
          <div className="chart__tooltip" style={{ left: x(hover), top: y(h.valor) }}>
            <strong>Semana del {etiqueta(h.semana)}</strong>
            {h.tipo === 'historico'
              ? <span>{h.valor} reportes</span>
              : <><span>Esperado: {h.valor}</span><span>Rango probable: {h.min}–{h.max}</span></>}
          </div>
        ) : null}
      </div>
    </div>
  )
}
