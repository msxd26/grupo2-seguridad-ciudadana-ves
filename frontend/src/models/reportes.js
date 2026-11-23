// Modelo: estados de un reporte y textos amigables para el ciudadano.

export const ESTADOS_REPORTE = {
  pendiente: { label: 'En revisión', icono: '⏳', descripcion: 'Nuestro equipo está revisando tu reporte.' },
  verificado: { label: 'Verificado', icono: '✅', descripcion: '¡Gracias! Tu reporte fue confirmado y ayuda a otros vecinos.' },
  descartado: { label: 'No procede', icono: '💬', descripcion: 'Revisamos tu reporte y no pudimos confirmarlo.' },
}

// Pasos de la línea de tiempo del reporte.
export const PASOS = ['Enviado', 'En revisión', 'Resuelto']
export const pasoActual = (estado) => (estado === 'pendiente' ? 1 : 2)

export const ICONOS_TIPO = {
  Robo: '👜',
  Hurto: '👛',
  Extorsión: '📞',
  Estafa: '💳',
  'Violencia contra la mujer': '🛑',
  Secuestro: '🚨',
  'Microcomercialización de drogas': '💊',
  Pandillaje: '⚠️',
  'Consumo de alcohol en vía pública': '🍺',
  'Alumbrado o zona insegura': '💡',
  Otro: '📌',
}

export const CONSEJOS = [
  { icono: '📱', titulo: 'Celular a buen recaudo', texto: 'Evita usarlo en paraderos y esquinas; guárdalo antes de bajar del transporte.' },
  { icono: '👀', titulo: 'Rutas iluminadas', texto: 'De noche, prefiere calles con luz y movimiento, aunque el camino sea un poco más largo.' },
  { icono: '🤝', titulo: 'Conoce a tus vecinos', texto: 'Un grupo vecinal de WhatsApp ayuda a avisar rápido ante algo sospechoso.' },
  { icono: '📞', titulo: 'Extorsión: no negocies', texto: 'Si recibes amenazas, no pagues ni respondas: denuncia al 105 o en tu comisaría.' },
  { icono: '🏠', titulo: 'Casa segura', texto: 'Al salir, deja una luz encendida y no publiques en redes que estás de viaje.' },
  { icono: '💜', titulo: 'Pide ayuda', texto: 'Ante violencia familiar llama gratis a la Línea 100, las 24 horas.' },
]

export function saludo(fecha = new Date()) {
  const h = fecha.getHours()
  if (h < 12) return { texto: 'Buenos días', icono: '☀️' }
  if (h < 19) return { texto: 'Buenas tardes', icono: '🌤️' }
  return { texto: 'Buenas noches', icono: '🌙' }
}
