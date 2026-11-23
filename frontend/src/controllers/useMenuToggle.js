import { useCallback, useEffect, useState } from 'react'

// Controlador: estado del menú móvil del header.
export function useMenuToggle() {
  const [isOpen, setIsOpen] = useState(false)

  // setState funcional → callbacks estables, sin depender de `isOpen`.
  const toggle = useCallback(() => setIsOpen((open) => !open), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Cerrar con Escape solo mientras el menú está abierto.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return { isOpen, toggle, close }
}
