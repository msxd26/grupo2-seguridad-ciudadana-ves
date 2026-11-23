// Modelo: datos estáticos de navegación y contacto.
// Se definen a nivel de módulo para no recrearlos en cada render.

export const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', to: '/' },
  { id: 'dashboard', label: 'Panel municipal', to: '/dashboard' },
  { id: 'mapa', label: 'Mapa', to: '/mapa' },
  { id: 'alertas', label: 'Alertas', to: '/alertas' },
  { id: 'contacto', label: 'Contacto', to: '/contacto' },
]

export const EMERGENCY_NUMBERS = [
  { id: 'policia', label: 'Policía Nacional', number: '105' },
  { id: 'bomberos', label: 'Bomberos', number: '116' },
  { id: 'samu', label: 'SAMU', number: '106' },
  { id: 'linea100', label: 'Línea 100 (violencia familiar)', number: '100' },
]

export const FUENTES = [
  { id: 'sidpol', label: 'Denuncias policiales – MININTER', href: 'https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter' },
  { id: 'comisarias', label: 'Comisarías PNP – MININTER', href: 'https://www.datosabiertos.gob.pe/dataset/comisar%C3%ADas-b%C3%A1sicas-de-la-polic%C3%ADa-nacional-del-per%C3%BA-mininter' },
  { id: 'osm', label: 'Límite distrital – OpenStreetMap', href: 'https://www.openstreetmap.org/relation/1944858' },
]
