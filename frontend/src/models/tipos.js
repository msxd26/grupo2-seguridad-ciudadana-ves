import {
  IconoAbandonado, IconoAcoso, IconoIntento, IconoOscura, IconoOtro, IconoRobo, IconoSospecha,
} from './iconos'

// Tipos de incidente de Tu Vecino (plan HackODS UA 2026): semáforo rojo / naranja / amarillo…
// `color` es para puntos y fondos; `texto` es la variante con contraste ≥ 4.5:1 sobre blanco (WCAG AA).
export const TIPOS = [
  { id: 'robo', label: 'Robo', guiado: 'Me robaron algo', color: '#DC2626', texto: '#DC2626', nivel: 'peligro', Icono: IconoRobo },
  { id: 'intento_robo', label: 'Intento de robo', guiado: 'Intentaron robarme', color: '#F97316', texto: '#C2410C', nivel: 'atencion', Icono: IconoIntento },
  { id: 'acoso', label: 'Acoso', guiado: 'Me acosaron', color: '#CA8A04', texto: '#A16207', nivel: 'peligro', Icono: IconoAcoso },
  { id: 'actividad_sospechosa', label: 'Actividad sospechosa', guiado: 'Vi algo sospechoso', color: '#334155', texto: '#334155', nivel: 'atencion', Icono: IconoSospecha },
  { id: 'zona_oscura', label: 'Zona oscura', guiado: 'Hay una zona muy oscura', color: '#0EA5E9', texto: '#0369A1', nivel: 'info', Icono: IconoOscura },
  { id: 'espacio_abandonado', label: 'Espacio abandonado', guiado: 'Hay un espacio abandonado', color: '#92400E', texto: '#92400E', nivel: 'info', Icono: IconoAbandonado },
  { id: 'otro', label: 'Otro', guiado: 'Otra cosa', color: '#64748B', texto: '#475569', nivel: 'info', Icono: IconoOtro },
]

const porId = new Map(TIPOS.map((t) => [t.id, t]))
export const tipoDe = (id) => porId.get(id) ?? porId.get('otro')
export const etiquetaTipo = (id) => tipoDe(id).label
export const colorTipo = (id) => tipoDe(id).color

export const NIVELES = {
  peligro: { label: 'Peligro', color: '#DC2626' },
  atencion: { label: 'Atención', color: '#F97316' },
  info: { label: 'Info', color: '#0EA5E9' },
}

export const MODOS = {
  formulario: 'Formulario',
  chat: 'Chat IA',
  guiado: 'Paso a paso',
}

// "hace 5 min", "hace 2 h", "hace 3 días"
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
export function haceCuanto(fecha) {
  const seg = (new Date(fecha).getTime() - Date.now()) / 1000
  const abs = Math.abs(seg)
  if (abs < 60) return 'hace un momento'
  if (abs < 3600) return rtf.format(Math.round(seg / 60), 'minute')
  if (abs < 86_400) return rtf.format(Math.round(seg / 3600), 'hour')
  return rtf.format(Math.round(seg / 86_400), 'day')
}

// Distancia en metros (para el filtro "Mi zona").
export function distanciaMetros(lat1, lng1, lat2, lng2) {
  const rad = (g) => (g * Math.PI) / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a))
}
