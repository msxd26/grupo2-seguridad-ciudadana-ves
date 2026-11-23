import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const EventosContext = createContext(null)

// Conexión única de Server-Sent Events con el backend: nuevos reportes en tiempo real.
// Los componentes se suscriben con `suscribir(fn)`; el último reporte alimenta el aviso global.
export function EventosProvider({ children }) {
  const [ultimo, setUltimo] = useState(null)
  const [conectado, setConectado] = useState(false)
  const oyentes = useRef(new Set())

  useEffect(() => {
    if (typeof EventSource === 'undefined') return
    const fuente = new EventSource('/api/eventos')
    const avisar = (tipo, datos) => oyentes.current.forEach((fn) => fn(tipo, datos))

    fuente.onopen = () => setConectado(true)
    fuente.onerror = () => setConectado(false) // EventSource reintenta solo
    fuente.addEventListener('reporte', (e) => {
      const reporte = JSON.parse(e.data)
      setUltimo(reporte)
      avisar('reporte', reporte)
    })
    fuente.addEventListener('reporte-oculto', (e) => avisar('reporte-oculto', JSON.parse(e.data)))
    return () => fuente.close()
  }, [])

  const suscribir = useCallback((fn) => {
    oyentes.current.add(fn)
    return () => oyentes.current.delete(fn)
  }, [])

  const descartar = useCallback(() => setUltimo(null), [])

  const valor = useMemo(() => ({ ultimo, conectado, suscribir, descartar }), [ultimo, conectado, suscribir, descartar])
  return <EventosContext value={valor}>{children}</EventosContext>
}

export function useEventos() {
  const ctx = use(EventosContext)
  if (!ctx) throw new Error('useEventos debe usarse dentro de <EventosProvider>')
  return ctx
}
