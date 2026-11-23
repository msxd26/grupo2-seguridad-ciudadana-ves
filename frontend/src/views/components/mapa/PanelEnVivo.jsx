import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventos } from '../../../context/EventosContext'
import { confirmarReporte } from '../../../services/seguridadService'
import ControlNotificaciones from '../ControlNotificaciones'
import { haceCuanto, tipoDe } from '../../../models/tipos'

const MAXIMO = 15

// Feed de actividad en vivo sobre el mapa: vecinos conectados, reportes que llegan al instante,
// "seguir en vivo" (el mapa vuela al reporte nuevo) y avisos del navegador cerca de mí.
export default function PanelEnVivo({ reportes, nuevos, seguir, onSeguir, onElegir, seleccionado }) {
  const { conectado, conectados } = useEventos()
  // En celulares empieza plegado para que el mapa sea lo primero que se ve.
  const [abierto, setAbierto] = useState(() => !window.matchMedia?.('(max-width: 760px)').matches)
  const [, setTic] = useState(0)
  const [votos, setVotos] = useState({}) // id -> 'enviando' | 'ok' | mensaje de error
  const listaRef = useRef(null)

  // El total se actualiza solo: el servidor emite "reporte-actualizado" a todos los mapas.
  const confirmar = async (id) => {
    setVotos((v) => ({ ...v, [id]: 'enviando' }))
    try {
      await confirmarReporte(id)
      setVotos((v) => ({ ...v, [id]: 'ok' }))
    } catch (err) {
      setVotos((v) => ({ ...v, [id]: err.message }))
    }
  }

  // Refresca los "hace X min" cada 30 segundos.
  useEffect(() => {
    const t = setInterval(() => setTic((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // Orden de llegada (como un feed): lo último reportado arriba.
  const llegada = (r) => new Date(r.creadoEn ?? r.fechaHecho).getTime()
  const lista = reportes.toSorted((a, b) => llegada(b) - llegada(a)).slice(0, MAXIMO)

  // Con "Seguir" activo, el reporte seleccionado (p. ej. uno nuevo que llegó en vivo) se hace visible en la lista.
  const primero = lista[0]?.id
  useEffect(() => {
    if (!seguir || !seleccionado || !listaRef.current) return
    const item = listaRef.current.querySelector(`[data-id="${seleccionado}"]`)
    const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    item?.scrollIntoView({ block: 'nearest', behavior: suave ? 'smooth' : 'auto' })
  }, [seguir, seleccionado, primero])

  return (
    <section className={abierto ? 'en-vivo' : 'en-vivo en-vivo--cerrado'} aria-label="Actividad en vivo">
      <header className="en-vivo__cabecera">
        <button type="button" className="en-vivo__titulo" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
          <span className={conectado ? 'punto-vivo' : 'punto-vivo punto-vivo--off'} aria-hidden="true" />
          {conectado ? 'En vivo' : 'Reconectando…'}
          <span className="en-vivo__conectados">· {conectados} vecino{conectados === 1 ? '' : 's'} conectado{conectados === 1 ? '' : 's'}</span>
          <span className="en-vivo__flecha" aria-hidden="true">{abierto ? '▾' : '▴'}</span>
        </button>
      </header>

      {abierto ? (
        <>
          <div className="en-vivo__controles">
            <label className="interruptor">
              <input type="checkbox" checked={seguir} onChange={(e) => onSeguir(e.target.checked)} />
              <span className="interruptor__pista" aria-hidden="true" />
              Seguir reportes nuevos
            </label>
            <ControlNotificaciones compacto />
          </div>

          <ol className="en-vivo__lista" ref={listaRef}>
            {lista.map((r) => {
              const t = tipoDe(r.tipo)
              const clases = ['en-vivo__item', nuevos.has(r.id) && 'en-vivo__item--nuevo', seleccionado === r.id && 'en-vivo__item--activo'].filter(Boolean).join(' ')
              const voto = votos[r.id]
              const total = r.confirmaciones ?? 0
              return (
                <li key={r.id} data-id={r.id} className="en-vivo__fila">
                  <button type="button" className={clases} onClick={() => onElegir(r)} style={{ '--color-tipo': t.color }}>
                    <span className="en-vivo__icono" aria-hidden="true"><t.Icono size={16} /></span>
                    <span className="en-vivo__texto">
                      <strong>{t.label}{nuevos.has(r.id) ? <span className="badge-nuevo">NUEVO</span> : null}</strong>
                      <span>{r.referencia ?? 'Villa El Salvador'} · {haceCuanto(r.fechaHecho)}</span>
                    </span>
                  </button>
                  {/* Confirmación comunitaria a la vista: cada vecino puede validar el reporte de otro. */}
                  <div className="en-vivo__confirmar">
                    <span>{total ? `👀 ${total} vecino${total === 1 ? '' : 's'} lo confirma${total === 1 ? '' : 'n'}` : 'Nadie lo confirmó aún'}</span>
                    <button
                      type="button"
                      onClick={() => confirmar(r.id)}
                      disabled={voto === 'enviando' || voto === 'ok'}
                      aria-label={`Yo también lo vi: confirmar el reporte de ${t.label}`}
                    >
                      {voto === 'ok' ? '¡Gracias!' : '¿También lo viste? +1'}
                    </button>
                    {voto && voto !== 'ok' && voto !== 'enviando' ? <p className="en-vivo__error" role="alert">{voto}</p> : null}
                  </div>
                </li>
              )
            })}
            {!lista.length ? (
              <li className="en-vivo__vacio">
                Todo tranquilo por ahora. Si ves algo, <Link to="/reportar">puedes reportarlo aquí →</Link>
              </li>
            ) : null}
          </ol>
        </>
      ) : null}
    </section>
  )
}
