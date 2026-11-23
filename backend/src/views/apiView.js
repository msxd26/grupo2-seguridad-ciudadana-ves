// Vista: formato estándar de todas las respuestas JSON de la API.
export const apiView = {
  ok(data, extra = {}) {
    return { ok: true, ...extra, data }
  },
  error(message, detalles) {
    return detalles ? { ok: false, error: message, detalles } : { ok: false, error: message }
  },
}
