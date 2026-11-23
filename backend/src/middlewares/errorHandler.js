import { estadisticasView } from '../views/estadisticasView.js'

const DB_ERRORS = {
  ECONNREFUSED: 'MySQL no está en ejecución',
  ER_ACCESS_DENIED_ERROR: 'MySQL rechazó el usuario o la contraseña (revisa backend/.env)',
  ER_BAD_DB_ERROR: 'la base de datos no existe (ejecuta "npm run db:setup")',
  ER_NO_SUCH_TABLE: 'faltan las tablas (ejecuta "npm run db:setup")',
}

export function notFound(_req, res) {
  res.status(404).json(estadisticasView.error('Recurso no encontrado'))
}

// Express identifica el manejador de errores por sus 4 parámetros.
export function errorHandler(err, _req, res, _next) {
  console.error(err)
  const message = DB_ERRORS[err.code] ?? 'Error interno del servidor'
  res.status(500).json(estadisticasView.error(message))
}
