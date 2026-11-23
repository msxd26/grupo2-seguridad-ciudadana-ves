import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const VACIO = { nombre: '', email: '', password: '' }

// Controlador del formulario de ingreso / registro.
export function useIngreso(onExito) {
  const { login, registro } = useAuth()
  const [modo, setModo] = useState('ingresar') // 'ingresar' | 'registro'
  const [valores, setValores] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cambiarModo = (m) => {
    setModo(m)
    setErrores({})
    setErrorGeneral(null)
  }

  const setCampo = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }

  function validar() {
    const e = {}
    if (modo === 'registro' && valores.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre'
    if (!/^\S+@\S+\.\S{2,}$/.test(valores.email.trim())) e.email = 'Escribe un correo válido'
    if (modo === 'registro') {
      if (valores.password.length < 8) e.password = 'Mínimo 8 caracteres'
      else if (!/[A-Za-z]/.test(valores.password) || !/\d/.test(valores.password)) e.password = 'Usa letras y números'
    } else if (!valores.password) {
      e.password = 'Escribe tu contraseña'
    }
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
      const usuario = modo === 'registro'
        ? await registro({ nombre: valores.nombre, email: valores.email, password: valores.password })
        : await login({ email: valores.email, password: valores.password })
      onExito(usuario)
    } catch (err) {
      setErrorGeneral(err.message)
      if (err.detalles) setErrores(err.detalles)
    } finally {
      setEnviando(false)
    }
  }

  return { modo, cambiarModo, valores, setCampo, errores, errorGeneral, enviando, enviar }
}
