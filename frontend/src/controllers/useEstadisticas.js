import { useEffect, useState } from 'react'
import { fetchDetalleAnio, fetchPorAnio } from '../services/estadisticasService'

// Controlador: carga la serie anual una vez y el detalle del año seleccionado.
export function useEstadisticas() {
  const [general, setGeneral] = useState(null) // { porAnio, fuente }
  const [anio, setAnio] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchPorAnio(controller.signal)
      .then((data) => {
        setGeneral(data)
        setAnio(data.porAnio.at(-1)?.anio ?? null) // año más reciente por defecto
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (anio === null) return
    const controller = new AbortController()
    setCargando(true)
    fetchDetalleAnio(anio, controller.signal)
      .then((data) => {
        setDetalle(data)
        setError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })
    return () => controller.abort()
  }, [anio])

  return { general, anio, setAnio, detalle, error, cargando }
}
