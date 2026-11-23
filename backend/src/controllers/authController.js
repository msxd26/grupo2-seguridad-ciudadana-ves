import { COOKIE_SESION, firmarToken, login, opcionesCookie, registrar } from '../services/authService.js'
import { apiView } from '../views/apiView.js'

function iniciarSesion(res, usuario, status = 200) {
  res.cookie(COOKIE_SESION, firmarToken(usuario), opcionesCookie())
  res.status(status).json(apiView.ok(usuario))
}

export const authController = {
  async registro(req, res) {
    iniciarSesion(res, await registrar(req.body ?? {}), 201)
  },

  async login(req, res) {
    iniciarSesion(res, await login(req.body ?? {}))
  },

  logout(_req, res) {
    const { maxAge: _m, ...opciones } = opcionesCookie()
    res.clearCookie(COOKIE_SESION, opciones)
    res.json(apiView.ok(null))
  },

  // Usuario de la sesión actual (null si no hay sesión).
  me(req, res) {
    res.json(apiView.ok(req.usuario ?? null))
  },
}
