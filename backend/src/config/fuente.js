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

// Tipos de incidente de Tu Vecino (plan HackODS UA 2026). `nivel` define el color de la alerta.
export const TIPOS_INCIDENTE = [
  { id: 'robo', label: 'Robo', nivel: 'peligro' },
  { id: 'intento_robo', label: 'Intento de robo', nivel: 'atencion' },
  { id: 'acoso', label: 'Acoso', nivel: 'peligro' },
  { id: 'actividad_sospechosa', label: 'Actividad sospechosa', nivel: 'atencion' },
  { id: 'zona_oscura', label: 'Zona oscura', nivel: 'info' },
  { id: 'espacio_abandonado', label: 'Espacio abandonado', nivel: 'info' },
  { id: 'otro', label: 'Otro', nivel: 'info' },
]
export const TIPOS_REPORTE = TIPOS_INCIDENTE.map((t) => t.id)
const porId = new Map(TIPOS_INCIDENTE.map((t) => [t.id, t]))
export const etiquetaTipo = (id) => porId.get(id)?.label ?? id
export const nivelTipo = (id) => porId.get(id)?.nivel ?? 'info'

export const MODOS_REPORTE = ['formulario', 'chat', 'guiado']
export const MARCAS_PARA_OCULTAR = 3
