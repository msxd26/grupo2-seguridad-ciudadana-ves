import { useState } from 'react'
import { crearReporte } from '../services/seguridadService'
import { puntoEnPoligono } from '../models/mapa'

// "2026-11-23T10:30" en hora local, para el input datetime-local.
function ahoraLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const crearInicial = () => ({ tipo: '', descripcion: '', referencia: '', fechaHecho: ahoraLocal(), ubicacion: null })

// Controlador del formulario de reporte ciudadano.
export function useReporteForm(limite) {
  const [valores, setValores] = useState(crearInicial)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)

  const setCampo = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }

  const setUbicacion = (lat, lng) => {
    if (!puntoEnPoligono(lat, lng, limite)) {
      setErrores((e) => ({ ...e, ubicacion: 'Ese punto está fuera de Villa El Salvador' }))
      return
    }
    setCampo('ubicacion', { lat, lng })
  }

  function validar() {
    const e = {}
    if (!valores.tipo) e.tipo = 'Selecciona el tipo de incidente'
    if (valores.descripcion.trim().length < 10) e.descripcion = 'Describe lo ocurrido (mínimo 10 caracteres)'
    if (!valores.ubicacion) e.ubicacion = 'Haz clic en el mapa para marcar dónde ocurrió'
    if (!valores.fechaHecho) e.fechaHecho = 'Indica la fecha y hora'
    else if (new Date(valores.fechaHecho) > new Date()) e.fechaHecho = 'La fecha no puede estar en el futuro'
    return e
  }

  async function enviar(event) {
    event.preventDefault()
    const e = validar()
    setErrores(e)
    if (Object.keys(e).length) return
    setEnviando(true)
    setErrorGeneral(null)
    try {
      const reporte = await crearReporte({
        tipo: valores.tipo,
        descripcion: valores.descripcion,
        referencia: valores.referencia,
        lat: valores.ubicacion.lat,
        lng: valores.ubicacion.lng,
        fechaHecho: new Date(valores.fechaHecho).toISOString(),
      })
      setEnviado(reporte)
      setValores(crearInicial())
    } catch (err) {
      setErrorGeneral(err.message)
      if (err.detalles) setErrores(err.detalles)
    } finally {
      setEnviando(false)
    }
  }

  const nuevo = () => setEnviado(null)

  return { valores, errores, enviando, enviado, errorGeneral, setCampo, setUbicacion, enviar, nuevo }
}
