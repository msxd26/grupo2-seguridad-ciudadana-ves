// Modelo: constantes y formatos para las estadísticas de denuncias.

export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
]

const numberFormat = new Intl.NumberFormat('es-PE')
export const formatNumero = (n) => numberFormat.format(n)

// "ene–oct" para años incompletos.
export const periodoCorto = (ultimoMes) =>
  ultimoMes === 12 ? 'año completo' : `ene–${MESES_CORTOS[ultimoMes - 1].toLowerCase()}`

export const FUENTE_POR_DEFECTO = {
  entidad: 'Ministerio del Interior (MININTER)',
  sistema: 'Sistema de Denuncias Policiales (SIDPOL) - PNP',
  portal: 'Plataforma Nacional de Datos Abiertos del Perú',
  url: 'https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter',
}
