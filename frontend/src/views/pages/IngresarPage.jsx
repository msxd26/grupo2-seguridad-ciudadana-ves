import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIngreso } from '../../controllers/useIngreso'
import FondoVes from '../components/FondoVes'
import '../../assets/styles/cuenta.css'

const BENEFICIOS = [
  { icono: '📍', texto: 'Reporta incidentes y sigue su estado' },
  { icono: '🔔', texto: 'Entérate de las alertas de tu zona' },
  { icono: '🤝', texto: 'Ayuda a que tu barrio sea más seguro' },
]

// Solo se permiten rutas internas como destino de regreso.
const destinoSeguro = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : null)

export default function IngresarPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const volver = destinoSeguro(params.get('volver'))
  const [verPassword, setVerPassword] = useState(false)

  const destinoPara = (u) => volver ?? (u.rol === 'admin' ? '/admin' : '/mi-cuenta')
  const form = useIngreso((u) => navigate(destinoPara(u), { replace: true }))
  const { modo, valores, errores } = form

  if (usuario) return <Navigate to={destinoPara(usuario)} replace />

  const esRegistro = modo === 'registro'

  return (
    <section className="ingreso">
      <div className="ingreso__bienvenida con-fondo-ves">
        <FondoVes variante="teal" />
        <div className="ingreso__bienvenida-contenido">
          <span className="ingreso__emoji" aria-hidden="true">👋</span>
          <h1>¡Hola, vecino/a!</h1>
          <p>Únete a la red de vecinos que cuidan Villa El Salvador.</p>
          <ul>
            {BENEFICIOS.map((b) => (
              <li key={b.texto}><span aria-hidden="true">{b.icono}</span>{b.texto}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pestañas y formulario en una sola tarjeta, centrada en su columna. */}
      <div className="ingreso__tarjeta">
        <div className="tabs" role="tablist" aria-label="Ingresar o crear cuenta">
          <button type="button" role="tab" aria-selected={!esRegistro} className={!esRegistro ? 'activo' : undefined} onClick={() => form.cambiarModo('ingresar')}>
            Ingresar
          </button>
          <button type="button" role="tab" aria-selected={esRegistro} className={esRegistro ? 'activo' : undefined} onClick={() => form.cambiarModo('registro')}>
            Crear cuenta
          </button>
        </div>

        <form className="form-amable" onSubmit={form.enviar} noValidate>
          <h2>{esRegistro ? 'Crea tu cuenta gratis' : 'Qué bueno verte de nuevo'}</h2>

          {esRegistro ? (
            <div className="campo-amable">
              <label htmlFor="i-nombre">¿Cómo te llamas?</label>
              <input id="i-nombre" autoComplete="name" value={valores.nombre} onChange={(e) => form.setCampo('nombre', e.target.value)} placeholder="Tu nombre" aria-invalid={Boolean(errores.nombre)} />
              {errores.nombre ? <span className="campo-amable__error">{errores.nombre}</span> : null}
            </div>
          ) : null}

          <div className="campo-amable">
            <label htmlFor="i-email">Correo electrónico</label>
            <input id="i-email" type="email" autoComplete="email" value={valores.email} onChange={(e) => form.setCampo('email', e.target.value)} placeholder="tucorreo@ejemplo.com" aria-invalid={Boolean(errores.email)} />
            {errores.email ? <span className="campo-amable__error">{errores.email}</span> : null}
          </div>

          <div className="campo-amable">
            <label htmlFor="i-pass">Contraseña</label>
            <div className="campo-amable__password">
              <input
                id="i-pass"
                type={verPassword ? 'text' : 'password'}
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
                value={valores.password}
                onChange={(e) => form.setCampo('password', e.target.value)}
                placeholder={esRegistro ? 'Mínimo 8 caracteres, letras y números' : 'Tu contraseña'}
                aria-invalid={Boolean(errores.password)}
              />
              <button type="button" onClick={() => setVerPassword((v) => !v)} aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {verPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            {errores.password ? <span className="campo-amable__error">{errores.password}</span> : null}
          </div>

          {form.errorGeneral && !Object.values(errores).some(Boolean) ? (
            <div className="aviso-amable aviso-amable--error" role="alert">{form.errorGeneral}</div>
          ) : null}

          <button type="submit" className="boton-amable" disabled={form.enviando}>
            {form.enviando ? 'Un momento…' : esRegistro ? 'Crear mi cuenta' : 'Ingresar'}
          </button>

          <p className="form-amable__nota">
            {esRegistro
              ? 'Solo usamos tu correo para que ingreses. Tus reportes se muestran en el mapa sin tu nombre.'
              : <>¿Aún no tienes cuenta? <button type="button" className="enlace" onClick={() => form.cambiarModo('registro')}>Créala aquí</button></>}
          </p>
        </form>
      </div>
    </section>
  )
}
