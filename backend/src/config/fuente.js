// Metadatos de las fuentes oficiales y constantes del dominio.
export const FUENTE_DENUNCIAS = {
  nombre: 'Denuncias policiales registradas a nivel nacional',
  entidad: 'Ministerio del Interior (MININTER)',
  sistema: 'Sistema de Denuncias Policiales (SIDPOL) - PNP',
  portal: 'Plataforma Nacional de Datos Abiertos del Perú',
  url: 'https://www.datosabiertos.gob.pe/dataset/denuncias-policiales-registradas-nivel-nacional-mininter',
  cobertura: 'Lima Metropolitana (43 distritos)',
}

export const FUENTE_COMISARIAS = {
  nombre: 'Comisarías básicas de la Policía Nacional del Perú (noviembre 2019)',
  entidad: 'Ministerio del Interior (MININTER)',
  url: 'https://www.datosabiertos.gob.pe/dataset/comisar%C3%ADas-b%C3%A1sicas-de-la-polic%C3%ADa-nacional-del-per%C3%BA-mininter',
}

export const FUENTE_LIMITE = {
  nombre: 'Límite distrital de Villa El Salvador',
  entidad: 'OpenStreetMap (ODbL)',
  url: 'https://www.openstreetmap.org/relation/1944858',
}

export const UBIGEO_VES = '150142'

// El dataset trunca este nombre; se muestra completo.
export const MODALIDAD_COMPLETA = {
  'Violencia contra la mujer e integrantes': 'Violencia contra la mujer e integrantes del grupo familiar',
}
export const nombreModalidad = (m) => MODALIDAD_COMPLETA[m] ?? m

// Tipos que un ciudadano puede reportar (alineados con las modalidades oficiales).
export const TIPOS_REPORTE = [
  'Robo',
  'Hurto',
  'Extorsión',
  'Estafa',
  'Violencia contra la mujer',
  'Secuestro',
  'Microcomercialización de drogas',
  'Pandillaje',
  'Consumo de alcohol en vía pública',
  'Alumbrado o zona insegura',
  'Otro',
]
