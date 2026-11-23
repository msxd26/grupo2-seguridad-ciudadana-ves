// Servicio: comunicación con la API de estadísticas del backend.
const API = '/api/estadisticas'

async function getJson(path, signal) {
  const res = await fetch(`${API}${path}`, { signal })
  const body = await res.json().catch(() => null)
  // Sin JSON = el proxy de Vite no encontró el backend.
  if (!body) throw new Error('el backend no responde (ejecuta "npm run dev" en la carpeta backend)')
  if (!res.ok || !body.ok) throw new Error(body.error ?? `Error ${res.status}`)
  return body
}

export async function fetchPorAnio(signal) {
  const body = await getJson('/por-anio', signal)
  return { porAnio: body.data, fuente: body.fuente }
}

// Las tres consultas del año son independientes: se piden en paralelo.
export async function fetchDetalleAnio(anio, signal) {
  const [resumen, porModalidad, porMes, porMesAnterior] = await Promise.all([
    getJson(`/resumen?anio=${anio}`, signal),
    getJson(`/por-modalidad?anio=${anio}`, signal),
    getJson(`/por-mes?anio=${anio}`, signal),
    getJson(`/por-mes?anio=${anio - 1}`, signal),
  ])
  return {
    resumen: resumen.data,
    porModalidad: porModalidad.data,
    porMes: porMes.data,
    porMesAnterior: porMesAnterior.data,
  }
}
