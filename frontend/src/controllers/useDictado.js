import { useCallback, useEffect, useRef, useState } from 'react'

const Reconocimiento = typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined

// Dictado por voz (Web Speech API) para reportar sin escribir. `onTexto` recibe lo reconocido.
export function useDictado(onTexto) {
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState(null)
  const rec = useRef(null)
  const onTextoRef = useRef(onTexto)
  onTextoRef.current = onTexto

  useEffect(() => () => rec.current?.abort(), [])

  const alternar = useCallback(() => {
    if (!Reconocimiento) return
    if (rec.current) {
      rec.current.stop()
      return
    }
    const r = new Reconocimiento()
    r.lang = 'es-PE'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e) => onTextoRef.current(e.results[0][0].transcript)
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'Permite el uso del micrófono para dictar.' : 'No te escuché bien, intenta otra vez.')
    r.onend = () => {
      rec.current = null
      setEscuchando(false)
    }
    setError(null)
    setEscuchando(true)
    rec.current = r
    r.start()
  }, [])

  return { disponible: Boolean(Reconocimiento), escuchando, error, alternar }
}
