// Modelo: constantes y formatos para las estadísticas.

export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
]

const numberFormat = new Intl.NumberFormat('es-PE')
export const formatNumero = (n) => numberFormat.format(n)

export const formatVariacion = (v) => (v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${v}%`)

export const nombreModalidadCorto = (m) =>
  m.startsWith('Violencia contra la mujer') ? 'Violencia contra la mujer y GF' : m

export const PRIORIDADES = {
  alta: { label: 'Alta', icono: '▲' },
  media: { label: 'Media', icono: '■' },
  baja: { label: 'Baja', icono: '▼' },
}

export const UBIGEO_VES = '150142'
