import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'

const EventosContext = createContext(null)

const PING_MS = 25_000
const ESPERA_MAX_MS = 15_000

// URL del WebSocket en el mismo host que la página (ws:// o wss:// según HTTP o HTTPS).
const urlWs = () => `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws`

// Conexión WebSocket única con el backend: todo lo que reportan los vecinos llega al instante.
// - `ultimo`: último reporte recibido (aviso global)
// - `conectados`: vecinos con la app abierta ahora
// - `estado`: 'conectando' | 'conectado' | 'reconectando'
// - `suscribir(fn)`: recibe (tipo, datos) de cada evento
export function EventosProvider({ children }) {
  const { usuario } = useAuth()
  const [ultimo, setUltimo] = useState(null)
  const [estado, setEstado] = useState('conectando')
  const [conectados, setConectados] = useState(0)
  const oyentes = useRef(new Set())

  // Se reconecta al iniciar o cerrar sesión para que el servidor sepa quién es (avisos privados).
  const idUsuario = usuario?.id ?? null

  useEffect(() => {
    if (typeof WebSocket === 'undefined') return undefined
    let socket = null
    let intentos = 0
    let reintento = null
    let ping = null
    let cerradoAPropósito = false

    const avisar = (tipo, datos) => oyentes.current.forEach((fn) => fn(tipo, datos))

    function conectar() {
      socket = new WebSocket(urlWs())

      socket.onopen = () => {
        intentos = 0
        setEstado('conectado')
        // Ping de aplicación: mantiene viva la conexión a través de proxies.
        ping = setInterval(() => socket.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ tipo: 'ping' })), PING_MS)
      }

      socket.onmessage = (e) => {
        let mensaje
        try { mensaje = JSON.parse(e.data) } catch { return }
        const { tipo, datos } = mensaje
        if (tipo === 'presencia' || tipo === 'bienvenida') setConectados(datos.conectados)
        if (tipo === 'reporte') setUltimo(datos)
        if (tipo !== 'pong') avisar(tipo, datos)
      }

      socket.onclose = () => {
        clearInterval(ping)
        if (cerradoAPropósito) return
        setEstado('reconectando')
        // Reconexión con espera creciente: 1 s, 2 s, 4 s… hasta 15 s.
        const espera = Math.min(ESPERA_MAX_MS, 1000 * 2 ** intentos++)
        reintento = setTimeout(conectar, espera)
      }

      socket.onerror = () => socket.close()
    }

    conectar()
    return () => {
      cerradoAPropósito = true
      clearTimeout(reintento)
      clearInterval(ping)
      socket?.close()
    }
  }, [idUsuario])

  const suscribir = useCallback((fn) => {
    oyentes.current.add(fn)
    return () => oyentes.current.delete(fn)
  }, [])

  const descartar = useCallback(() => setUltimo(null), [])

  const valor = useMemo(
    () => ({ ultimo, estado, conectado: estado === 'conectado', conectados, suscribir, descartar }),
    [ultimo, estado, conectados, suscribir, descartar],
  )
  return <EventosContext value={valor}>{children}</EventosContext>
}

export function useEventos() {
  const ctx = use(EventosContext)
  if (!ctx) throw new Error('useEventos debe usarse dentro de <EventosProvider>')
  return ctx
}
