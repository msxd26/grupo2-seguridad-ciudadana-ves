import { useCallback, useEffect, useRef, useState } from 'react'

// Controlador genérico: ejecuta una consulta asíncrona y expone datos, error y estado de carga.
// `fetcher` recibe un AbortSignal; la consulta se repite cuando cambian `deps`.
export function useAsync(fetcher, deps) {
  const [state, setState] = useState({ data: null, error: null, cargando: true })
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ ...s, cargando: true }))
    fetcherRef.current(controller.signal)
      .then((data) => setState({ data, error: null, cargando: false }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, error: err.message, cargando: false }))
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, recargar }
}
