import { useCallback, useEffect, useState } from 'react'
import { useEventos } from '../context/EventosContext'
import { distanciaMetros, tipoDe } from '../models/tipos'

const CLAVE = 'tuvecino:avisos-cercanos'
const RADIO = 1500 // metros

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? null
  } catch {
    return null
  }
}

// "Avísame de reportes cerca de mí": notificaciones del navegador para reportes nuevos
// a menos de 1.5 km de la ubicación del vecino. La preferencia se guarda en este navegador.
// Solo una instancia debe usar `escuchar: true` (el oyente global en el layout).
export function useNotificacionesCercanas({ escuchar = false } = {}) {
  const { suscribir } = useEventos()
  const [config, setConfig] = useState(leer) // { lat, lng } | null
  const [error, setError] = useState(null)

  const soportado = typeof window !== 'undefined' && 'Notification' in window

  useEffect(() => {
    if (!escuchar) return undefined
    return suscribir((evento, r) => {
        const c = leer() // se lee en cada evento: refleja cambios hechos desde el panel
        if (evento !== 'reporte' || !c || Notification.permission !== 'granted') return
        const d = distanciaMetros(c.lat, c.lng, r.lat, r.lng)
        if (d > RADIO) return
        const t = tipoDe(r.tipo)
        const n = new Notification(`Tu Vecino · ${t.label} a ${Math.round(d / 10) * 10} m`, {
          body: `${r.descripcion}${r.referencia ? ` (${r.referencia})` : ''}`,
          tag: `reporte-${r.id}`,
        })
        n.onclick = () => {
          window.focus()
          window.location.assign(`/mapa?lat=${r.lat}&lng=${r.lng}`)
        }
      })
  }, [escuchar, suscribir])

  const activar = useCallback(async () => {
    setError(null)
    if (!soportado) return setError('Tu navegador no permite notificaciones.')
    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') return setError('Debes permitir las notificaciones para recibir avisos.')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const c = { lat: coords.latitude, lng: coords.longitude }
        try { localStorage.setItem(CLAVE, JSON.stringify(c)) } catch { /* sin almacenamiento: solo esta sesión */ }
        setConfig(c)
      },
      () => setError('No pudimos obtener tu ubicación para saber qué es "cerca".'),
      { timeout: 10_000 },
    )
  }, [soportado])

  const desactivar = useCallback(() => {
    try { localStorage.removeItem(CLAVE) } catch { /* nada que limpiar */ }
    setConfig(null)
  }, [])

  return { activo: Boolean(config), soportado, error, activar, desactivar, radio: RADIO }
}
