import { useEffect, useRef, useState } from 'react'

// Controlador: mide el ancho real de un elemento para dibujar los gráficos
// a escala 1:1 (el texto conserva su tamaño en cualquier pantalla).
export function useElementWidth(initial = 640) {
  const ref = useRef(null)
  const [width, setWidth] = useState(initial)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width)
      setWidth((prev) => (prev === w ? prev : w))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}
