import { apiView } from '../views/apiView.js'

// Límite simple en memoria: máximo `max` peticiones por IP cada `ventanaMs`.
export function rateLimit({ max, ventanaMs, mensaje = 'Demasiados intentos. Espera unos minutos.' }) {
  const registros = new Map() // ip -> timestamps

  return (req, res, next) => {
    const ahora = Date.now()
    const recientes = (registros.get(req.ip) ?? []).filter((t) => ahora - t < ventanaMs)
    if (recientes.length >= max) return res.status(429).json(apiView.error(mensaje))
    recientes.push(ahora)
    registros.set(req.ip, recientes)
    next()
  }
}
