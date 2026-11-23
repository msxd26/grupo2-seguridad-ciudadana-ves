import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const EventosContext = createContext(null)
const EVENTOS = ['reporte', 'reporte-oculto', 'reporte-actualizado', 'simulacion']

// Conexión única de Server-Sent Events con el backend.
// - `ultimo`: último reporte recibido (alimenta el aviso global)
// - `conectados`: vecinos con la app abierta en este momento
// - `suscribir(fn)`: recibe (tipo, datos) de cada evento
export function EventosProvider({ children }) {
  const [ultimo, setUltimo] = useState(null)
  const [conectado, setConectado] = useState(false)
  const [conectados, setConectados] = useState(0)
  const oyentes = useRef(new Set())

  useEffect(() => {
    if (typeof EventSource === 'undefined') return
    const fuente = new EventSource('/api/eventos')
    const avisar = (tipo, datos) => oyentes.current.forEach((fn) => fn(tipo, datos))

    fuente.onopen = () => setConectado(true)
    fuente.onerror = () => setConectado(false) // EventSource reintenta solo
    fuente.addEventListener('presencia', (e) => setConectados(JSON.parse(e.data).conectados))
    for (const tipo of EVENTOS) {
      fuente.addEventListener(tipo, (e) => {
        const datos = JSON.parse(e.data)
        if (tipo === 'reporte') setUltimo(datos)
        avisar(tipo, datos)
      })
    }
    return () => fuente.close()
  }, [])

  const suscribir = useCallback((fn) => {
    oyentes.current.add(fn)
    return () => oyentes.current.delete(fn)
  }, [])

  const descartar = useCallback(() => setUltimo(null), [])

  const valor = useMemo(
    () => ({ ultimo, conectado, conectados, suscribir, descartar }),
    [ultimo, conectado, conectados, suscribir, descartar],
  )
  return <EventosContext value={valor}>{children}</EventosContext>
}

export function useEventos() {
  const ctx = use(EventosContext)
  if (!ctx) throw new Error('useEventos debe usarse dentro de <EventosProvider>')
  return ctx
}
