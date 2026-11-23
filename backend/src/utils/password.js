import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const LONGITUD = 64

// Formato guardado: scrypt$<salt hex>$<hash hex>
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await scryptAsync(password, salt, LONGITUD)
  return `scrypt$${salt}$${hash.toString('hex')}`
}

export async function verificarPassword(password, guardado) {
  const [algoritmo, salt, hashHex] = String(guardado).split('$')
  if (algoritmo !== 'scrypt' || !salt || !hashHex) return false
  const esperado = Buffer.from(hashHex, 'hex')
  const calculado = await scryptAsync(password, salt, esperado.length)
  return timingSafeEqual(esperado, calculado) // comparación en tiempo constante
}
