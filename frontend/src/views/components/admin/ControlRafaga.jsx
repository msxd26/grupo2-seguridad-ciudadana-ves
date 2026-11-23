import { useEffect, useState } from 'react'
import { useEventos } from '../../../context/EventosContext'
import { generarRafaga } from '../../../services/cuentaService'
import ControlNotificaciones from '../ControlNotificaciones'

const CANTIDADES = [3, 5, 10]

// "Generar alertas ahora": crea una ráfaga de reportes DEMO para probar los avisos
// de la web (en pantalla y del navegador) y las notificaciones de la app Android.
export default function ControlRafaga() {
  const { suscribir, conectados } = useEventos()
  const [cantidad, setCantidad] = useState(5)
  const [progreso, setProgreso] = useState(null) // null | { total, llegados, terminada }
  const [error, setError] = useState(null)

  useEffect(
    () =>
      suscribir((tipo, datos) => {
        if (tipo === 'rafaga' && datos.estado === 'iniciada') setProgreso({ total: datos.cantidad, llegados: 0, terminada: false })
        if (tipo === 'rafaga' && datos.estado === 'terminada') setProgreso((p) => (p ? { ...p, terminada: true } : p))
        if (tipo === 'reporte' && datos.esDemo) setProgreso((p) => (p && !p.terminada ? { ...p, llegados: p.llegados + 1 } : p))
      }),
    [suscribir],
  )

  const enCurso = progreso && !progreso.terminada

  const generar = async () => {
    setError(null)
    try {
      await generarRafaga({ cantidad })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="adm-rafaga">
      <div className="adm-rafaga__texto">
        <h2>⚡ Generar alertas ahora</h2>
        <p>
          Crea {cantidad} reportes <strong>DEMO</strong> seguidos (uno cada 1.5 s) en lugares aleatorios de Villa El Salvador.
          Llegan al instante a la web y a la app de los {conectados} dispositivo{conectados === 1 ? '' : 's'} conectado{conectados === 1 ? '' : 's'}.
        </p>
        {progreso ? (
          <p className="adm-rafaga__progreso" role="status">
            {progreso.terminada
              ? `✔ Listo: ${progreso.llegados} alertas enviadas.`
              : `Enviando… ${progreso.llegados} de ${progreso.total}`}
          </p>
        ) : null}
        {error ? <div className="adm-error">{error}</div> : null}
        <ControlNotificaciones compacto />
      </div>
      <div className="adm-rafaga__controles">
        <label className="adm-label">
          Cantidad
          <select className="adm-input adm-input--chico" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} disabled={Boolean(enCurso)}>
            {CANTIDADES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button type="button" className="adm-boton adm-boton--primario adm-rafaga__boton" onClick={generar} disabled={Boolean(enCurso)}>
          {enCurso ? 'Enviando…' : `⚡ Generar ${cantidad} alertas`}
        </button>
      </div>
    </section>
  )
}
