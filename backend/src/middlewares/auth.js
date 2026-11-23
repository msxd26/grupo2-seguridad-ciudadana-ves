import { COOKIE_SESION, usuarioDesdeToken } from '../services/authService.js'
import { apiView } from '../views/apiView.js'

// Lee la sesión (si existe) y deja el usuario en req.usuario. No bloquea.
export async function autenticar(req, _res, next) {
  req.usuario = await usuarioDesdeToken(req.cookies?.[COOKIE_SESION])
  next()
}

export function requerirSesion(req, res, next) {
  if (!req.usuario) return res.status(401).json(apiView.error('Inicia sesión para continuar'))
  next()
}

export const requerirRol = (rol) => (req, res, next) => {
  if (!req.usuario) return res.status(401).json(apiView.error('Inicia sesión para continuar'))
  if (req.usuario.rol !== rol) return res.status(403).json(apiView.error('No tienes permisos para esta acción'))
  next()
}
