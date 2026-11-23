import { useId, useState } from 'react'
import { useNotificacionesCercanas } from '../../controllers/useNotificacionesCercanas'
import { CONFIG_INICIAL, RADIOS, TIPOS_AVISO } from '../../models/avisos'

const describir = (c) => {
  const radio = RADIOS.find((r) => r.metros === c.radio) ?? RADIOS.at(-1)
  const donde = c.radio ? `a menos de ${radio.label}` : 'en todo el distrito'
  const que = c.soloPeligro ? 'solo nivel Peligro' : c.tipos.length ? c.tipos.map((t) => TIPOS_AVISO.find((x) => x.id === t)?.label.toLowerCase()).join(', ') : 'todos los tipos'
  return `${donde} · ${que}`
}

// Avisos del navegador: cercanía (radio), tipos y "solo Peligro". Las ráfagas llegan en un solo aviso.
export default function ControlNotificaciones({ compacto = false }) {
  const n = useNotificacionesCercanas()
  const [abierto, setAbierto] = useState(false)
  const [borrador, setBorrador] = useState(() => n.config ?? { ...CONFIG_INICIAL, radio: 1000 })
  const id = useId()
  if (!n.soportado) return null

  // Sin HTTPS el navegador bloquea las notificaciones automáticamente (no es un ajuste de la persona).
  if (!window.isSecureContext) {
    return (
      <div className={compacto ? 'notif notif--compacto' : 'notif'}>
        <p className="notif__aviso" role="note">
          <strong>🔒 Avisos no disponibles en esta dirección.</strong> El navegador solo permite notificaciones en sitios seguros
          (https). Usa la app Tu Vecino o abre la versión segura del sitio cuando esté disponible.
        </p>
      </div>
    )
  }

  // La persona bloqueó el permiso: solo se puede revertir desde el navegador.
  if (Notification.permission === 'denied') {
    return (
      <div className={compacto ? 'notif notif--compacto' : 'notif'}>
        <p className="notif__aviso" role="note">
          <strong>🔕 Bloqueaste los avisos de este sitio.</strong> Para activarlos: toca el candado junto a la dirección →
          Configuración del sitio → Notificaciones → Permitir, y recarga la página.
        </p>
      </div>
    )
  }

  const abrir = () => { setBorrador(n.config ?? { ...CONFIG_INICIAL, radio: 1000 }); setAbierto(true) }
  const alternarTipo = (t) =>
    setBorrador((b) => ({ ...b, tipos: b.tipos.includes(t) ? b.tipos.filter((x) => x !== t) : [...b.tipos, t] }))
  const guardar = async () => { if (await n.aplicar(borrador)) setAbierto(false) }

  return (
    <div className={compacto ? 'notif notif--compacto' : 'notif'}>
      {!abierto ? (
        <div className={n.activo ? 'notif__estado' : 'notif__estado notif__estado--off'}>
          <span aria-hidden="true">{n.activo ? '🔔' : '🔕'}</span>
          <span>
            {n.activo ? <>Avisos: <strong>{describir(n.config)}</strong></> : 'Avisos del navegador desactivados'}
          </span>
          <button type="button" className="notif__boton" onClick={abrir} aria-expanded={false} aria-controls={`${id}-panel`}>
            {n.activo ? 'Cambiar' : 'Activar avisos'}
          </button>
          {n.activo ? <button type="button" className="notif__quitar" onClick={n.desactivar}>Desactivar</button> : null}
        </div>
      ) : (
        <div className="notif__panel" id={`${id}-panel`}>
          <fieldset className="notif__grupo">
            <legend>¿De qué distancia?</legend>
            <div className="notif__opciones-radio">
              {RADIOS.map((r) => (
                <label key={r.label} className={borrador.radio === r.metros ? 'notif__chip notif__chip--activo' : 'notif__chip'}>
                  <input type="radio" name={`${id}-radio`} checked={borrador.radio === r.metros} onChange={() => setBorrador((b) => ({ ...b, radio: r.metros }))} />
                  {r.label}
                </label>
              ))}
            </div>
            {borrador.radio ? <p className="notif__ayuda">Usaremos tu ubicación actual. Se guarda solo en este navegador.</p> : null}
          </fieldset>

          <fieldset className="notif__grupo">
            <legend>¿De qué tipo?</legend>
            <label className="notif__check">
              <input type="checkbox" checked={borrador.soloPeligro} onChange={(e) => setBorrador((b) => ({ ...b, soloPeligro: e.target.checked }))} />
              Solo nivel Peligro (robo y acoso)
            </label>
            {!borrador.soloPeligro ? (
              <div className="notif__tipos" role="group" aria-label="Tipos de incidente (ninguno marcado = todos)">
                {TIPOS_AVISO.map((t) => (
                  <label key={t.id} className={borrador.tipos.includes(t.id) ? 'notif__chip notif__chip--activo' : 'notif__chip'}>
                    <input type="checkbox" checked={borrador.tipos.includes(t.id)} onChange={() => alternarTipo(t.id)} />
                    {t.label}
                  </label>
                ))}
              </div>
            ) : null}
            {!borrador.soloPeligro && !borrador.tipos.length ? <p className="notif__ayuda">Sin marcar ninguno, te avisamos de todos los tipos.</p> : null}
          </fieldset>

          <p className="notif__ayuda">Si llegan varios reportes seguidos, recibirás un solo aviso con el resumen.</p>
          <div className="notif__acciones">
            <button type="button" className="notif__boton notif__boton--principal" onClick={guardar} disabled={n.ubicando}>
              {n.ubicando ? 'Obteniendo ubicación…' : n.activo ? 'Guardar' : 'Activar avisos'}
            </button>
            <button type="button" className="notif__boton" onClick={() => setAbierto(false)}>Cancelar</button>
          </div>
        </div>
      )}
      {n.error ? <p className="notif__error" role="alert">{n.error}</p> : null}
    </div>
  )
}
