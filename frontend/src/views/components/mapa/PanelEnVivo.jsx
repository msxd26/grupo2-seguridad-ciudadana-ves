import { useEffect, useState } from 'react'
import { useEventos } from '../../../context/EventosContext'
import { useNotificacionesCercanas } from '../../../controllers/useNotificacionesCercanas'
import { haceCuanto, tipoDe } from '../../../models/tipos'

const MAXIMO = 15

// Feed de actividad en vivo sobre el mapa: vecinos conectados, reportes que llegan al instante,
// "seguir en vivo" (el mapa vuela al reporte nuevo) y avisos del navegador cerca de mí.
export default function PanelEnVivo({ reportes, nuevos, seguir, onSeguir, onElegir, seleccionado }) {
  const { conectado, conectados } = useEventos()
  const avisos = useNotificacionesCercanas()
  const [abierto, setAbierto] = useState(true)
  const [, setTic] = useState(0)

  // Refresca los "hace X min" cada 30 segundos.
  useEffect(() => {
    const t = setInterval(() => setTic((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // Orden de llegada (como un feed): lo último reportado arriba.
  const llegada = (r) => new Date(r.creadoEn ?? r.fechaHecho).getTime()
  const lista = reportes.toSorted((a, b) => llegada(b) - llegada(a)).slice(0, MAXIMO)

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
            {avisos.soportado ? (
              <button type="button" className={avisos.activo ? 'en-vivo__avisos en-vivo__avisos--on' : 'en-vivo__avisos'} onClick={avisos.activo ? avisos.desactivar : avisos.activar}>
                {avisos.activo ? '🔔 Avisos cerca de mí: activados' : '🔕 Avisarme de reportes cerca de mí'}
              </button>
            ) : null}
            {avisos.error ? <p className="en-vivo__error">{avisos.error}</p> : null}
          </div>

          <ol className="en-vivo__lista">
            {lista.map((r) => {
              const t = tipoDe(r.tipo)
              const clases = ['en-vivo__item', nuevos.has(r.id) && 'en-vivo__item--nuevo', seleccionado === r.id && 'en-vivo__item--activo'].filter(Boolean).join(' ')
              return (
                <li key={r.id}>
                  <button type="button" className={clases} onClick={() => onElegir(r)} style={{ '--color-tipo': t.color }}>
                    <span className="en-vivo__icono" aria-hidden="true"><t.Icono size={16} /></span>
                    <span className="en-vivo__texto">
                      <strong>{t.label}{nuevos.has(r.id) ? <span className="badge-nuevo">NUEVO</span> : null}</strong>
                      <span>{r.referencia ?? 'Villa El Salvador'} · {haceCuanto(r.fechaHecho)}</span>
                    </span>
                    {r.confirmaciones ? <span className="en-vivo__votos" title="Vecinos que lo confirmaron">👀 {r.confirmaciones}</span> : null}
                  </button>
                </li>
              )
            })}
            {!lista.length ? <li className="en-vivo__vacio">Aún no hay reportes en este periodo.</li> : null}
          </ol>
        </>
      ) : null}
    </section>
  )
}
