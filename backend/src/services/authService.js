import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { UsuarioModel } from '../models/UsuarioModel.js'
import { hashPassword, verificarPassword } from '../utils/password.js'
import { ErrorValidacion } from '../utils/texto.js'

export const COOKIE_SESION = 'ves_sesion'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export class ErrorAuth extends Error {
  constructor(message, status = 401) {
    super(message)
    this.status = status
  }
}

const normalizarEmail = (e) => String(e ?? '').trim().toLowerCase()

export function opcionesCookie() {
  return {
    httpOnly: true, // inaccesible desde JavaScript del navegador
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: env.auth.sesionDias * 86_400_000,
    path: '/',
  }
}

export const firmarToken = (usuario) =>
  jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, env.auth.jwtSecret, { expiresIn: `${env.auth.sesionDias}d` })

// Devuelve el usuario vigente del token, o null si no es válido.
export async function usuarioDesdeToken(token) {
  if (!token) return null
  try {
    const { sub } = jwt.verify(token, env.auth.jwtSecret)
    const usuario = await UsuarioModel.buscarPorId(Number(sub))
    return usuario?.activo ? usuario : null // el rol se lee siempre de la base, no del token
  } catch {
    return null
  }
}

export function validarPassword(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Usa letras y números en tu contraseña'
  if (password.length > 72) return 'La contraseña es demasiado larga'
  return null
}

export async function registrar(body) {
  const nombre = String(body.nombre ?? '').replace(/\s+/g, ' ').trim()
  const email = normalizarEmail(body.email)
  const password = String(body.password ?? '')

  const errores = {}
  if (nombre.length < 2 || nombre.length > 80) errores.nombre = 'Escribe tu nombre (2 a 80 caracteres)'
  if (!EMAIL_RE.test(email) || email.length > 120) errores.email = 'Escribe un correo válido'
  const errorPass = validarPassword(password)
  if (errorPass) errores.password = errorPass
  if (Object.keys(errores).length) throw new ErrorValidacion('Revisa tus datos', errores)

  if (await UsuarioModel.buscarPorEmailConHash(email)) {
    throw new ErrorValidacion('Revisa tus datos', { email: 'Ya existe una cuenta con este correo' })
  }
  const usuario = await UsuarioModel.crear({ nombre, email, passwordHash: await hashPassword(password) })
  await UsuarioModel.registrarAcceso(usuario.id)
  return usuario
}

export async function login(body) {
  const email = normalizarEmail(body.email)
  const password = String(body.password ?? '')
  const encontrado = await UsuarioModel.buscarPorEmailConHash(email)
  // Mismo mensaje en ambos casos para no revelar qué correos existen.
  if (!encontrado || !(await verificarPassword(password, encontrado.passwordHash))) {
    throw new ErrorAuth('Correo o contraseña incorrectos')
  }
  if (!encontrado.activo) throw new ErrorAuth('Tu cuenta está desactivada. Comunícate con la municipalidad.', 403)
  await UsuarioModel.registrarAcceso(encontrado.id)
  const { passwordHash: _omitido, ...usuario } = encontrado
  return usuario
}
