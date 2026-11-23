import { useCallback, useEffect, useState } from 'react'
import { useEventos } from '../context/EventosContext'
import { tipoDe } from '../models/tipos'
import { CONFIG_INICIAL, crearAgrupador, cumpleFiltro, distanciaDesde, enlaceMapa, formatoDistancia, resumenTipos } from '../models/avisos'

const CLAVE = 'tuvecino:avisos:v2'
const CLAVE_ANTIGUA = 'tuvecino:avisos-cercanos'

// Preferencia guardada SOLO en este navegador (la ubicación no sale del dispositivo):
//   { radio: 500 | 1000 | 2000 | null, lat, lng, tipos: ['robo', …] (vacío = todos), soloPeligro }
function leer() {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE))
    if (c) return c
    // Migración del formato anterior: { modo: 'todas' } o { modo: 'cerca', lat, lng } (1,5 km)
    const v = JSON.parse(localStorage.getItem(CLAVE_ANTIGUA))
    if (!v) return null
    return v.modo === 'todas' ? { ...CONFIG_INICIAL } : { ...CONFIG_INICIAL, radio: 2000, lat: v.lat, lng: v.lng }
  } catch {
    return null
  }
}

function guardar(config) {
  try {
    localStorage.removeItem(CLAVE_ANTIGUA)
    if (config) localStorage.setItem(CLAVE, JSON.stringify(config))
    else localStorage.removeItem(CLAVE)
  } catch { /* sin almacenamiento: la preferencia dura solo esta sesión */ }
}

const ubicacionActual = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('sin geolocalización'))
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }), reject, { timeout: 10_000 })
  })

function notificar(lote, c) {
  const primero = lote[0]
  const n = lote.length === 1
    ? (() => {
        const d = distanciaDesde(c, primero)
        return new Notification(`Tu Vecino · ${tipoDe(primero.tipo).label}${d !== null ? ` a ${formatoDistancia(d)}` : ''}`, {
          body: `${primero.descripcion}${primero.referencia ? ` (${primero.referencia})` : ''}`,
          tag: `reporte-${primero.id}`,
        })
      })()
    : new Notification(`Tu Vecino · ${lote.length} reportes nuevos${c.radio ? ' cerca de ti' : ''}`, {
        body: `${resumenTipos(lote)}. Toca para verlos en el mapa.`,
        tag: `rafaga-${primero.id}`,
      })
  n.onclick = () => {
    window.focus()
    window.location.assign(enlaceMapa(lote))
  }
}

// Notificaciones del sistema para reportes nuevos, filtradas por cercanía y tipo,
// y agrupadas cuando llegan varios seguidos. Solo una instancia usa `escuchar: true` (layout).
export function useNotificacionesCercanas({ escuchar = false } = {}) {
  const { suscribir } = useEventos()
  const [config, setConfig] = useState(leer)
  const [error, setError] = useState(null)
  const [ubicando, setUbicando] = useState(false)

  const soportado = typeof window !== 'undefined' && 'Notification' in window

  useEffect(() => {
    if (!escuchar || !soportado) return undefined
    const agrupador = crearAgrupador((lote) => {
      const c = leer()
      if (c && Notification.permission === 'granted') notificar(lote, c)
    })
    const quitar = suscribir((evento, datos) => {
      const c = leer() // se lee en cada evento: refleja cambios hechos desde cualquier panel
      if (!c) return
      if (evento === 'rafaga') agrupador.rafaga(datos.estado)
      if (evento === 'reporte' && cumpleFiltro(c, datos)) agrupador.agregar(datos)
    })
    return () => { quitar(); agrupador.detener() }
  }, [escuchar, soportado, suscribir])

  const pedirPermiso = useCallback(async () => {
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
  }, [soportado])

  // Guarda la configuración; si hay radio, toma la ubicación actual (queda solo en este navegador).
  const aplicar = useCallback(async (nueva) => {
    if (!(await pedirPermiso())) return false
    let c = { ...CONFIG_INICIAL, ...nueva }
    if (c.radio) {
      setUbicando(true)
      try {
        c = { ...c, ...(await ubicacionActual()) }
      } catch {
        setUbicando(false)
        setError('No pudimos obtener tu ubicación. Elige "Todo el distrito" o activa el permiso de ubicación.')
        return false
      }
      setUbicando(false)
    } else {
      c = { ...c, lat: null, lng: null }
    }
    guardar(c)
    setConfig(c)
    return true
  }, [pedirPermiso])

  const desactivar = useCallback(() => {
    guardar(null)
    setConfig(null)
  }, [])

  return { config, activo: Boolean(config), soportado, error, ubicando, aplicar, desactivar }
}
