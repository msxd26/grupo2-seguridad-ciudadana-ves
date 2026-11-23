// Utilidades compartidas por los gráficos SVG.

// Escala "bonita" para el eje Y: devuelve el máximo redondeado y los ticks.
export function niceTicks(max, count = 4) {
  if (max <= 0) return { max: 1, ticks: [0, 1] }
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  // Paso mínimo 1: los datos son conteos (sin decimales en el eje).
  const step = Math.max(1, [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw))
  const top = Math.ceil(max / step) * step
  const ticks = []
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v)
  return { max: top, ticks }
}

const full = new Intl.NumberFormat('es-PE')
const miles = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 })

// Ticks completos bajo 10 000, compactos (5k, 10k) en ejes que lo superan.
export const tickFormatter = (axisMax) =>
  axisMax >= 10000 ? (v) => (v === 0 ? '0' : `${miles.format(v / 1000)}k`) : (v) => full.format(v)

// Columna con extremo superior redondeado (4px) y base recta.
export function columnPath(x, y, width, height, radius = 4) {
  const r = Math.min(radius, width / 2, height)
  const bottom = y + height
  return `M${x},${bottom}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${bottom}Z`
}
