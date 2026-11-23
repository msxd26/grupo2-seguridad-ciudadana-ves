import { useCallback, useState } from 'react'
import { crearReporte } from '../services/seguridadService'

// "ahora" | "hace_1h" | "hoy" → fecha aproximada del hecho.
export function fechaDesde(cuando) {
  const minutos = { ahora: 0, hace_1h: 45, hoy: 180 }[cuando] ?? 0
  return new Date(Date.now() - minutos * 60_000)
}

// Controlador común a los tres modos de reporte (formulario, chat, guiado).
export function useEnviarReporte() {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(null)
  const [error, setError] = useState(null)
  const [errores, setErrores] = useState({})

  const enviar = useCallback(async ({ tipo, modo, descripcion, referencia, ubicacion, fecha, iaConfianza, iaCorregido }) => {
    setEnviando(true)
    setError(null)
    setErrores({})
    try {
      const reporte = await crearReporte({
        tipo,
        modo,
        iaConfianza,
        iaCorregido,
        descripcion: descripcion ?? '',
        referencia: referencia ?? '',
        lat: ubicacion?.lat,
        lng: ubicacion?.lng,
        fechaHecho: (fecha ?? new Date()).toISOString(),
      })
      setEnviado(reporte)
      return reporte
    } catch (err) {
      setError(err.message)
      setErrores(err.detalles ?? {})
      return null
    } finally {
      setEnviando(false)
    }
  }, [])

  const reiniciar = useCallback(() => {
    setEnviado(null)
    setError(null)
    setErrores({})
  }, [])

  return { enviar, enviando, enviado, error, errores, reiniciar }
}
