import { useState } from 'react'
import { conversarIA } from '../services/seguridadService'
import { fechaDesde, useEnviarReporte } from './useEnviarReporte'

const SALUDO = { role: 'assistant', content: 'Hola 👋 Estoy aquí para ayudarte. ¿Qué pasó? Cuéntame como quieras, en tus palabras.' }

// Por debajo de este nivel de confianza la IA pregunta antes de pedir confirmación (igual que el backend).
export const UMBRAL_CONFIANZA = 70
// Como máximo una pregunta de seguimiento: después se muestra lo detectado para que el vecino confirme o corrija.
const MAX_DUDAS = 1

// Controlador del reporte conversacional ("la IA que razona contigo").
// Fases: 'conversando' → 'confirmar' → 'ubicacion' → enviado.
export function useChatReporte() {
  const [mensajes, setMensajes] = useState([SALUDO])
  const [fase, setFase] = useState('conversando')
  const [pensando, setPensando] = useState(false)
  const [borrador, setBorrador] = useState(null)
  const [ubicacion, setUbicacion] = useState(null)
  const [error, setError] = useState(null)
  const [dudas, setDudas] = useState(0)
  const [corregido, setCorregido] = useState(false) // el vecino corrigió a la IA al menos una vez
  const envio = useEnviarReporte()

  const agregar = (...nuevos) => setMensajes((m) => [...m, ...nuevos])

  async function enviarMensaje(texto) {
    const limpio = texto.trim()
    if (!limpio || pensando) return
    const historial = [...mensajes, { role: 'user', content: limpio }]
    setMensajes(historial)
    setPensando(true)
    setError(null)
    try {
      // Se envía la conversación sin el saludo inicial.
      const r = await conversarIA(historial.slice(1))
      const confianza = r.tipo ? (r.confianza ?? 75) : 0
      // Si la IA duda, pregunta primero; si ya preguntó, muestra lo que entendió para que el vecino decida.
      const duda = Boolean(r.tipo) && confianza < UMBRAL_CONFIANZA && dudas < MAX_DUDAS
      agregar({ role: 'assistant', content: r.mensaje, deteccion: r.tipo ? { tipo: r.tipo, zona: r.zona, confianza, duda } : null })
      if (r.tipo) {
        const textoUsuario = historial.filter((m) => m.role === 'user').map((m) => m.content).join('. ')
        setBorrador({ ...r, confianza, textoUsuario })
        if (duda) setDudas((d) => d + 1)
        else setFase('confirmar')
      }
    } catch (err) {
      setError(`${err.message}. Tu mensaje no se perdió: vuelve a enviarlo cuando quieras.`)
    } finally {
      setPensando(false)
    }
  }

  function confirmar() {
    agregar(
      { role: 'user', content: 'Sí, así fue' },
      { role: 'assistant', content: '¡Perfecto! Ahora dime dónde fue: usa tu ubicación o toca el lugar en el mapa de abajo.' },
    )
    setFase('ubicacion')
  }

  function corregir() {
    agregar(
      { role: 'user', content: 'Quiero corregir' },
      { role: 'assistant', content: 'Claro, vecino/a. Cuéntame qué es lo correcto y vuelvo a revisarlo.' },
    )
    setCorregido(true)
    setBorrador(null)
    setDudas(0)
    setFase('conversando')
  }

  async function enviarReporte() {
    // Nunca fallar en silencio: si falta algo, se le dice al vecino qué hacer.
    if (!borrador) {
      setError('No pude recuperar los datos del incidente. ¿Puedes contarme de nuevo qué pasó?')
      setFase('conversando')
      return
    }
    if (!ubicacion) {
      setError('Marca en el mapa dónde fue, o usa tu ubicación.')
      return
    }
    setError(null)
    // La descripción de la IA es breve; si queda muy corta, se usa lo que escribió el vecino.
    const descripcion = (borrador.descripcion?.length ?? 0) >= 10 ? borrador.descripcion : borrador.textoUsuario.slice(0, 500)
    await envio.enviar({
      tipo: borrador.tipo,
      modo: 'chat',
      descripcion,
      referencia: borrador.zona,
      ubicacion,
      fecha: fechaDesde(borrador.cuando),
      iaConfianza: borrador.confianza,
      iaCorregido: corregido,
    })
  }

  function reiniciar() {
    setMensajes([SALUDO])
    setFase('conversando')
    setBorrador(null)
    setUbicacion(null)
    setError(null)
    setDudas(0)
    setCorregido(false)
    envio.reiniciar()
  }

  return {
    mensajes, fase, pensando, borrador, ubicacion, setUbicacion, error, envio,
    enviarMensaje, confirmar, corregir, enviarReporte, reiniciar,
  }
}
