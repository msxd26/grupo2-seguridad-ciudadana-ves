export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
]

const PALABRAS_MENORES = new Set(['de', 'del', 'la', 'las', 'los'])

// "SAN JUAN DE LURIGANCHO" → "San Juan de Lurigancho"
export function tituloDistrito(nombre) {
  return nombre
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && PALABRAS_MENORES.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

const fmt = new Intl.NumberFormat('es-PE')
export const formatNumero = (n) => fmt.format(n)

export const variacionPorcentual = (actual, previo) =>
  previo ? Number((((actual - previo) / previo) * 100).toFixed(1)) : null

export const signo = (v) => (v > 0 ? `+${v}` : `${v}`)

// Error de validación que el manejador convierte en HTTP 400.
export class ErrorValidacion extends Error {
  constructor(message, detalles) {
    super(message)
    this.status = 400
    this.detalles = detalles
  }
}
