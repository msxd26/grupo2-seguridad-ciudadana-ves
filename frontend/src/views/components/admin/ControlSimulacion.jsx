import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../../controllers/useAsync'
import { useEventos } from '../../../context/EventosContext'
import { cambiarSimulacion, fetchSimulacion } from '../../../services/cuentaService'

const INTERVALOS = [5, 10, 20, 30]
const hora = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' })

// Simulación en vivo para presentaciones: genera reportes DEMO cada pocos segundos.
export default function ControlSimulacion() {
  const inicial = useAsync((signal) => fetchSimulacion(signal), [])
  const { suscribir, conectados } = useEventos()
  const [estado, setEstado] = useState(null)
  const [intervalo, setIntervalo] = useState(10)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (inicial.data) setEstado(inicial.data)
  }, [inicial.data])

  // Estado y contador en vivo (también si otro administrador la enciende o apaga).
  useEffect(
    () =>
      suscribir((evento, datos) => {
        if (evento === 'simulacion') setEstado(datos)
        if (evento === 'reporte' && datos.esDemo) setEstado((e) => (e?.activa ? { ...e, generados: e.generados + 1 } : e))
      }),
    [suscribir],
  )

  const alternar = async () => {
    setEnviando(true)
    setError(null)
    try {
      setEstado(await cambiarSimulacion({ activa: !estado?.activa, intervaloSeg: intervalo }))
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const activa = Boolean(estado?.activa)

  return (
    <section className={activa ? 'adm-simulacion adm-simulacion--activa' : 'adm-simulacion'}>
      <div>
        <h2>
          <span className={activa ? 'punto-vivo' : 'punto-vivo punto-vivo--off'} aria-hidden="true" /> Simulación en vivo para la demo
        </h2>
        <p>
          Genera reportes <strong>DEMO</strong> en lugares aleatorios de Villa El Salvador para mostrar el mapa y las alertas en
          tiempo real. Se apaga sola a los 30 minutos. {conectados} navegador{conectados === 1 ? '' : 'es'} conectado{conectados === 1 ? '' : 's'}.
        </p>
        {activa ? (
          <p className="adm-simulacion__estado">
            Activa · {estado.generados} reporte{estado.generados === 1 ? '' : 's'} generado{estado.generados === 1 ? '' : 's'} · cada ~{estado.intervaloSeg} s
            {estado.terminaEn ? ` · hasta las ${hora.format(new Date(estado.terminaEn))}` : ''} · <Link to="/mapa">Ver el mapa →</Link>
          </p>
        ) : null}
        {error ? <div className="adm-error">{error}</div> : null}
      </div>
      <div className="adm-simulacion__controles">
        {!activa ? (
          <label className="adm-label">
            Cada
            <select className="adm-input adm-input--chico" value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))}>
              {INTERVALOS.map((s) => <option key={s} value={s}>{s} s</option>)}
            </select>
          </label>
        ) : null}
        <button type="button" className={activa ? 'adm-boton adm-boton--descartar' : 'adm-boton adm-boton--verificar'} disabled={enviando || !estado} onClick={alternar}>
          {activa ? '■ Detener' : '▶ Iniciar simulación'}
        </button>
      </div>
    </section>
  )
}
