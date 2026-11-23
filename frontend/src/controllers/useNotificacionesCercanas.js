import { useCallback, useEffect, useState } from 'react'
import { useEventos } from '../context/EventosContext'
import { distanciaMetros, tipoDe } from '../models/tipos'

const CLAVE = 'tuvecino:avisos-cercanos'
const RADIO = 1500 // metros

// Preferencia guardada en este navegador:
//   { modo: 'todas' }                 → notificar todos los reportes
//   { modo: 'cerca', lat, lng }       → solo a menos de 1.5 km (formato antiguo: { lat, lng })
function leer() {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE))
    if (!c) return null
    return c.modo ? c : { modo: 'cerca', ...c }
  } catch {
    return null
  }
}

function guardar(config) {
  try {
    if (config) localStorage.setItem(CLAVE, JSON.stringify(config))
    else localStorage.removeItem(CLAVE)
  } catch { /* sin almacenamiento: la preferencia dura solo esta sesión */ }
}

// Notificaciones del sistema (Notification API) para reportes nuevos: todos o solo los cercanos.
// Solo una instancia debe usar `escuchar: true` (el oyente global en el layout).
export function useNotificacionesCercanas({ escuchar = false } = {}) {
  const { suscribir } = useEventos()
  const [config, setConfig] = useState(leer)
  const [error, setError] = useState(null)

  const soportado = typeof window !== 'undefined' && 'Notification' in window

  useEffect(() => {
    if (!escuchar) return undefined
    return suscribir((evento, r) => {
      const c = leer() // se lee en cada evento: refleja cambios hechos desde cualquier panel
      if (evento !== 'reporte' || !c || Notification.permission !== 'granted') return
      const d = c.modo === 'cerca' ? distanciaMetros(c.lat, c.lng, r.lat, r.lng) : null
      if (d !== null && d > RADIO) return
      const t = tipoDe(r.tipo)
      const n = new Notification(`Tu Vecino · ${t.label}${d !== null ? ` a ${Math.round(d / 10) * 10} m` : ''}`, {
        body: `${r.descripcion}${r.referencia ? ` (${r.referencia})` : ''}`,
        tag: `reporte-${r.id}`,
      })
      n.onclick = () => {
        window.focus()
        window.location.assign(`/mapa?lat=${r.lat}&lng=${r.lng}`)
      }
    })
  }, [escuchar, suscribir])

  async function pedirPermiso() {
    setError(null)
    if (!soportado) {
      setError('Tu navegador no permite notificaciones.')
      return false
    }
    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') {
      setError('Debes permitir las notificaciones del navegador para recibir avisos.')
      return false
    }
    return true
  }

  const activarTodas = useCallback(async () => {
    if (!(await pedirPermiso())) return
    const c = { modo: 'todas' }
    guardar(c)
    setConfig(c)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activar = useCallback(async () => {
    if (!(await pedirPermiso())) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const c = { modo: 'cerca', lat: coords.latitude, lng: coords.longitude }
        guardar(c)
        setConfig(c)
      },
      () => setError('No pudimos obtener tu ubicación para saber qué es "cerca". Usa "Todos los reportes".'),
      { timeout: 10_000 },
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const desactivar = useCallback(() => {
    guardar(null)
    setConfig(null)
  }, [])

  return { activo: Boolean(config), modo: config?.modo ?? null, soportado, error, activar, activarTodas, desactivar, radio: RADIO }
}
