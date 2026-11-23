// Servicio base: peticiones a la API del backend (proxy /api de Vite).
// La sesión viaja en una cookie httpOnly que el navegador envía automáticamente.

export class ApiError extends Error {
  constructor(message, { status, detalles } = {}) {
    super(message)
    this.status = status
    this.detalles = detalles
  }
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...options })
  const body = await res.json().catch(() => null)
  // Sin JSON = el proxy de Vite no encontró el backend.
  if (!body) throw new ApiError('El backend no responde (ejecuta "npm run dev" en la carpeta backend)', { status: res.status })
  if (!res.ok || !body.ok) throw new ApiError(body.error ?? `Error ${res.status}`, { status: res.status, detalles: body.detalles })
  return body.data
}

export const getJson = (path, signal) => request(path, { signal })

const conCuerpo = (method) => (path, data) =>
  request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  })

export const postJson = conCuerpo('POST')
export const patchJson = conCuerpo('PATCH')

export function toQuery(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && v.length === 0)) continue
    q.set(k, Array.isArray(v) ? v.join(',') : v === true ? '1' : String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}
