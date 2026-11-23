import { app } from './app.js'
import { env } from './config/env.js'
import { iniciarTiempoReal } from './utils/tiempoReal.js'

const servidor = app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}/api`)
})

// WebSocket comparte el mismo puerto que la API REST.
iniciarTiempoReal(servidor)
