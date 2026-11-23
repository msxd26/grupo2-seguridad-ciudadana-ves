import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { cerrarSesion, fetchSesion, iniciarSesion, registrarCuenta } from '../services/cuentaService'

const AuthContext = createContext(null)

// Estado global de la sesión: usuario actual y acciones de ingreso/salida.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchSesion(controller.signal)
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => {
        if (!controller.signal.aborted) setVerificando(false)
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (datos) => {
    const u = await iniciarSesion(datos)
    setUsuario(u)
    return u
  }, [])

  const registro = useCallback(async (datos) => {
    const u = await registrarCuenta(datos)
    setUsuario(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await cerrarSesion().catch(() => {})
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario, verificando, esAdmin: usuario?.rol === 'admin', login, registro, logout }),
    [usuario, verificando, login, registro, logout],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
