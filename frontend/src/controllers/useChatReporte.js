import { useState } from 'react'
import { conversarIA } from '../services/seguridadService'
import { etiquetaTipo } from '../models/tipos'
import { fechaDesde, useEnviarReporte } from './useEnviarReporte'

const SALUDO = { role: 'assistant', content: 'Hola, vecino/a. ¿Qué pasó? Cuéntame con tus palabras.' }

// Controlador del reporte conversacional.
// Fases: 'conversando' → 'confirmar' → 'ubicacion' → enviado.
export function useChatReporte() {
  const [mensajes, setMensajes] = useState([SALUDO])
  const [fase, setFase] = useState('conversando')
  const [pensando, setPensando] = useState(false)
  const [borrador, setBorrador] = useState(null)
  const [ubicacion, setUbicacion] = useState(null)
  const [error, setError] = useState(null)
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
      agregar({ role: 'assistant', content: r.mensaje, deteccion: r.tipo ? { tipo: r.tipo, zona: r.zona } : null })
      if (r.tipo) {
        const textoUsuario = historial.filter((m) => m.role === 'user').map((m) => m.content).join('. ')
        setBorrador({ ...r, textoUsuario })
        setFase('confirmar')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPensando(false)
    }
  }

  function confirmar() {
    agregar(
      { role: 'user', content: 'Sí, correcto' },
      { role: 'assistant', content: '¡Perfecto! ¿Dónde fue? Usa tu ubicación o toca el lugar en el mapa.' },
    )
    setFase('ubicacion')
  }

  function corregir() {
    agregar(
      { role: 'user', content: 'Quiero corregir' },
      { role: 'assistant', content: 'Claro, vecino/a. Cuéntame qué es lo correcto.' },
    )
    setFase('conversando')
  }

  async function enviarReporte() {
    if (!borrador || !ubicacion) return
    // La descripción de la IA es breve; si queda muy corta, se usa lo que escribió el vecino.
    const descripcion = (borrador.descripcion?.length ?? 0) >= 10 ? borrador.descripcion : borrador.textoUsuario.slice(0, 500)
    const reporte = await envio.enviar({
      tipo: borrador.tipo,
      modo: 'chat',
      descripcion,
      referencia: borrador.zona,
      ubicacion,
      fecha: fechaDesde(borrador.cuando),
    })
    if (reporte) {
      agregar({ role: 'assistant', content: `✅ ¡Reporte enviado! Gracias, vecino/a. Tu reporte de ${etiquetaTipo(reporte.tipo).toLowerCase()} ya aparece en el mapa.` })
    }
  }

  function reiniciar() {
    setMensajes([SALUDO])
    setFase('conversando')
    setBorrador(null)
    setUbicacion(null)
    setError(null)
    envio.reiniciar()
  }

  return {
    mensajes, fase, pensando, borrador, ubicacion, setUbicacion, error, envio,
    enviarMensaje, confirmar, corregir, enviarReporte, reiniciar,
  }
}
