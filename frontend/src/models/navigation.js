// Modelo: datos estáticos de navegación y contacto.
// Se definen a nivel de módulo para no recrearlos en cada render.

export const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', href: '#inicio' },
  { id: 'estadisticas', label: 'Estadísticas', href: '#estadisticas' },
  { id: 'reportar', label: 'Reportar incidente', href: '#reportar' },
  { id: 'mapa', label: 'Mapa de riesgo', href: '#mapa' },
  { id: 'alertas', label: 'Alertas', href: '#alertas' },
  { id: 'contacto', label: 'Contacto', href: '#contacto' },
]

export const EMERGENCY_NUMBERS = [
  { id: 'policia', label: 'Policía Nacional', number: '105' },
  { id: 'bomberos', label: 'Bomberos', number: '116' },
  { id: 'samu', label: 'SAMU', number: '106' },
]

export const FOOTER_LINKS = [
  { id: 'acerca', label: 'Acerca del proyecto', href: '#acerca' },
  { id: 'privacidad', label: 'Política de privacidad', href: '#privacidad' },
  { id: 'terminos', label: 'Términos de uso', href: '#terminos' },
]
