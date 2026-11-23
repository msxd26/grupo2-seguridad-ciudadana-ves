import { FUENTE_DENUNCIAS } from '../config/fuente.js'

// Vista: formato estándar de las respuestas JSON de la API.
export const estadisticasView = {
  ok(data, extra = {}) {
    return { ok: true, ...extra, data, fuente: FUENTE_DENUNCIAS }
  },
  error(message) {
    return { ok: false, error: message }
  },
}
