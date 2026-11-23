import { EventEmitter } from 'node:events'

// Bus de eventos en memoria: cuando se crea un reporte se avisa a todos los navegadores
// conectados por Server-Sent Events (equivalente a Supabase Realtime del plan).
export const bus = new EventEmitter()
bus.setMaxListeners(500)

export function emitir(tipo, datos) {
  bus.emit('evento', { tipo, datos })
}

// Maneja una conexión SSE: mantiene el canal abierto y envía cada evento.
export function suscribirSse(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()
  res.write('retry: 5000\n\n')

  const enviar = ({ tipo, datos }) => res.write(`event: ${tipo}\ndata: ${JSON.stringify(datos)}\n\n`)
  const latido = setInterval(() => res.write(': latido\n\n'), 25_000) // evita cortes por inactividad

  bus.on('evento', enviar)
  req.on('close', () => {
    clearInterval(latido)
    bus.off('evento', enviar)
  })
}
