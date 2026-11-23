import { WebSocketServer } from 'ws'
import { COOKIE_SESION, usuarioDesdeToken } from '../services/authService.js'
import { bus } from './eventos.js'

// Servidor WebSocket de Tu Vecino (ruta /api/ws).
// - Difunde a todos: reportes nuevos, confirmaciones, marcas, moderación, presencia y simulación.
// - Envía avisos privados al autor de un reporte (identificado con la cookie de sesión).
// Las escrituras siguen por REST (validación, sesión y límites por IP).

export const RUTA_WS = '/api/ws'
const LATIDO_MS = 30_000

let wss = null
const conexiones = new Set() // { socket, usuarioId, vivo }

export const totalConectados = () => conexiones.size

function leerCookie(header, nombre) {
  for (const parte of String(header ?? '').split(';')) {
    const [k, ...v] = parte.trim().split('=')
    if (k === nombre) return decodeURIComponent(v.join('='))
  }
  return null
}

function enviar(conexion, tipo, datos) {
  if (conexion.socket.readyState === conexion.socket.OPEN) conexion.socket.send(JSON.stringify({ tipo, datos }))
}

function difundir(tipo, datos) {
  const mensaje = JSON.stringify({ tipo, datos })
  for (const c of conexiones) if (c.socket.readyState === c.socket.OPEN) c.socket.send(mensaje)
}

const avisarPresencia = () => difundir('presencia', { conectados: conexiones.size })

export function iniciarTiempoReal(servidorHttp) {
  wss = new WebSocketServer({ server: servidorHttp, path: RUTA_WS, maxPayload: 4 * 1024 })

  wss.on('connection', async (socket, req) => {
    const conexion = { socket, usuarioId: null, vivo: true }
    conexiones.add(conexion)

    socket.on('pong', () => { conexion.vivo = true })
    socket.on('close', () => {
      conexiones.delete(conexion)
      avisarPresencia()
    })
    socket.on('error', () => socket.terminate())
    // El cliente solo envía "ping" de aplicación; cualquier otra cosa se ignora.
    socket.on('message', (raw) => {
      try {
        if (JSON.parse(raw.toString()).tipo === 'ping') enviar(conexion, 'pong', { t: Date.now() })
      } catch { /* mensaje inválido: se ignora */ }
    })

    // Identifica al vecino si tiene sesión (para avisos privados).
    const usuario = await usuarioDesdeToken(leerCookie(req.headers.cookie, COOKIE_SESION))
    conexion.usuarioId = usuario?.id ?? null

    enviar(conexion, 'bienvenida', { conectados: conexiones.size, usuario: usuario ? { id: usuario.id, nombre: usuario.nombre } : null })
    avisarPresencia()
  })

  // Latido: detecta y cierra conexiones caídas (celular sin señal, pestaña suspendida…).
  const latido = setInterval(() => {
    for (const c of conexiones) {
      if (!c.vivo) {
        c.socket.terminate()
        continue
      }
      c.vivo = false
      c.socket.ping()
    }
  }, LATIDO_MS)
  wss.on('close', () => clearInterval(latido))

  bus.on('evento', ({ tipo, datos }) => difundir(tipo, datos))
  bus.on('privado', ({ usuarioId, tipo, datos }) => {
    for (const c of conexiones) if (c.usuarioId === usuarioId) enviar(c, tipo, datos)
  })

  console.log(`Tiempo real (WebSocket) en ${RUTA_WS}`)
  return wss
}
