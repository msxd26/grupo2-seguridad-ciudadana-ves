import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

// Botón "Ingresar" o menú desplegable del usuario con sesión.
export default function UserMenu({ onNavegar }) {
  const { usuario, verificando, esAdmin, logout } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  // Cerrar al hacer clic fuera o con Escape (solo mientras está abierto).
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => {
      if (!ref.current?.contains(e.target)) setAbierto(false)
    }
    const escape = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  if (verificando) return <span className="user-menu__placeholder" />
  if (!usuario) {
    return (
      <Link className="user-menu__ingresar" to="/ingresar" onClick={onNavegar}>
        Ingresar
      </Link>
    )
  }

  const cerrar = () => {
    setAbierto(false)
    onNavegar?.()
  }
  const salir = async () => {
    cerrar()
    await logout()
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__boton"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span className={esAdmin ? 'avatar avatar--admin' : 'avatar'} aria-hidden="true">{iniciales(usuario.nombre)}</span>
        <span className="user-menu__nombre">{usuario.nombre.split(' ')[0]}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {abierto ? (
        <div className="user-menu__lista" role="menu">
          <div className="user-menu__info">
            <strong>{usuario.nombre}</strong>
            <span>{usuario.email}</span>
            <span className={esAdmin ? 'rol rol--admin' : 'rol'}>{esAdmin ? 'Administrador' : 'Vecino/a'}</span>
          </div>
          <Link role="menuitem" to="/mi-cuenta" onClick={cerrar}>Mi cuenta</Link>
          {esAdmin ? <Link role="menuitem" to="/admin" onClick={cerrar}>Panel de administración</Link> : null}
          <button role="menuitem" type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      ) : null}
    </div>
  )
}
