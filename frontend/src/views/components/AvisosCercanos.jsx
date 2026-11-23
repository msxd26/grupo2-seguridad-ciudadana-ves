import { useNotificacionesCercanas } from '../../controllers/useNotificacionesCercanas'

// Oyente global: envía notificaciones del navegador de reportes cercanos en cualquier página.
export default function AvisosCercanos() {
  useNotificacionesCercanas({ escuchar: true })
  return null
}
