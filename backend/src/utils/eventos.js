import { EventEmitter } from 'node:events'

// Bus de eventos en memoria. Los servicios publican aquí y el servidor WebSocket
// (utils/tiempoReal.js) los reparte a los navegadores conectados.
export const bus = new EventEmitter()
bus.setMaxListeners(100)

// Evento público: llega a todos los vecinos conectados.
export function emitir(tipo, datos) {
  bus.emit('evento', { tipo, datos })
}

// Evento privado: llega solo a las conexiones de un usuario (ej. "tu reporte fue verificado").
export function emitirAUsuario(usuarioId, tipo, datos) {
  if (usuarioId) bus.emit('privado', { usuarioId, tipo, datos })
}
