import { apiView } from '../views/apiView.js'

const DB_ERRORS = {
  ECONNREFUSED: 'MySQL no está en ejecución (docker compose up -d)',
  ER_ACCESS_DENIED_ERROR: 'MySQL rechazó el usuario o la contraseña (revisa backend/.env)',
  ER_BAD_DB_ERROR: 'la base de datos no existe (ejecuta "npm run db:setup")',
  ER_NO_SUCH_TABLE: 'faltan tablas (ejecuta "npm run db:setup")',
  ER_BAD_FIELD_ERROR: 'faltan migraciones (ejecuta "npm run db:migrate")',
}

export function notFound(_req, res) {
  res.status(404).json(apiView.error('Recurso no encontrado'))
}

// Express identifica el manejador de errores por sus 4 parámetros.
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json(apiView.error('JSON inválido'))
  // Errores esperados (validación, sesión, permisos, no encontrado).
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json(apiView.error(err.message, err.detalles))
  }
  console.error(err)
  res.status(500).json(apiView.error(DB_ERRORS[err.code] ?? 'Error interno del servidor'))
}
