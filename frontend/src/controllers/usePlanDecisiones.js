import { useCallback, useState } from 'react'

// Decisiones del funcionario sobre las acciones propuestas: la IA propone, el humano decide.
// v1: se guardan en este navegador (localStorage). { [accionId]: { estado, edicion } }
const CLAVE = 'tv-plan-decisiones:v1'

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? {}
  } catch {
    return {}
  }
}

function guardar(valor) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento (modo privado): las decisiones viven solo en esta sesión.
  }
}

export function usePlanDecisiones() {
  const [decisiones, setDecisiones] = useState(leer)

  const actualizar = useCallback((id, cambio) => {
    setDecisiones((d) => {
      const siguiente = { ...d, [id]: { ...d[id], ...cambio } }
      guardar(siguiente)
      return siguiente
    })
  }, [])

  const aceptar = useCallback((id) => actualizar(id, { estado: 'aceptada' }), [actualizar])
  const descartar = useCallback((id) => actualizar(id, { estado: 'descartada' }), [actualizar])
  const editar = useCallback((id, edicion) => actualizar(id, { estado: 'aceptada', edicion }), [actualizar])
  const deshacer = useCallback((id) => {
    setDecisiones((d) => {
      const { [id]: _, ...resto } = d
      guardar(resto)
      return resto
    })
  }, [])

  return { decisiones, aceptar, descartar, editar, deshacer }
}
