import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fechaDesde, useEnviarReporte } from '../../../controllers/useEnviarReporte'
import { useLimite } from '../../../controllers/useLimite'
import { TIPOS, tipoDe } from '../../../models/tipos'
import UbicacionSelector from '../../components/reporte/UbicacionSelector'
import ReporteEnviado from '../../components/reporte/ReporteEnviado'
import '../../../assets/styles/reportar.css'

const CUANDO = [
  { id: 'ahora', label: 'Ahora mismo' },
  { id: 'hace_1h', label: 'Hace menos de 1 hora' },
  { id: 'hoy', label: 'Hoy, más temprano' },
]
const PASOS = ['¿Qué pasó?', '¿Dónde fue?', '¿Cuándo fue?', 'Confirmar']

// Modo 3: wizard accesible (una pregunta por pantalla, botones grandes, letra ≥ 18px).
export default function ReportarGuiadoPage() {
  const limite = useLimite()
  const envio = useEnviarReporte()
  const [paso, setPaso] = useState(0)
  const [tipo, setTipo] = useState(null)
  const [ubicacion, setUbicacion] = useState(null)
  const [cuando, setCuando] = useState(null)

  const reiniciar = () => {
    envio.reiniciar()
    setPaso(0)
    setTipo(null)
    setUbicacion(null)
    setCuando(null)
  }

  if (envio.enviado) {
    return <section className="reportar container guiado"><ReporteEnviado reporte={envio.enviado} onOtro={reiniciar} /></section>
  }

  const progreso = Math.round(((paso + 1) / PASOS.length) * 100)
  const elegido = tipo ? tipoDe(tipo) : null

  return (
    <section className="reportar container guiado">
      <Link to="/reportar" className="volver">← Cambiar forma de reportar</Link>

      <div className="guiado__progreso">
        <span aria-hidden="true">Paso {paso + 1} de {PASOS.length}: <strong>{PASOS[paso]}</strong></span>
        <div className="barra" role="progressbar" aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuetext={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso]}`} aria-label="Progreso del reporte">
          <span style={{ width: `${progreso}%` }} />
        </div>
      </div>

      {paso === 0 ? (
        <div className="guiado__paso">
          <h1>¿Qué pasó?</h1>
          <div className="botones-grandes">
            {TIPOS.map(({ id, guiado, color, Icono }) => (
              <button key={id} type="button" className="boton-grande" style={{ '--color-tipo': color }} onClick={() => { setTipo(id); setPaso(1) }}>
                <Icono size={30} aria-hidden="true" /> {guiado}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {paso === 1 ? (
        <div className="guiado__paso">
          <h1>¿Dónde fue?</h1>
          <p className="guiado__ayuda">Toca el botón azul para usar tu ubicación, o toca el lugar en el mapa.</p>
          <UbicacionSelector limite={limite} valor={ubicacion} onCambiar={setUbicacion} grande altura={320} />
          <div className="guiado__nav">
            <button type="button" className="boton-grande boton-grande--secundario" aria-label="Atrás: volver al paso anterior" onClick={() => setPaso(0)}><span aria-hidden="true">←</span> Atrás</button>
            <button type="button" className="boton-grande boton-grande--primario" disabled={!ubicacion} onClick={() => setPaso(2)}>Siguiente <span aria-hidden="true">→</span></button>
          </div>
        </div>
      ) : null}

      {paso === 2 ? (
        <div className="guiado__paso">
          <h1>¿Cuándo fue?</h1>
          <div className="botones-grandes">
            {CUANDO.map((c) => (
              <button key={c.id} type="button" className="boton-grande" onClick={() => { setCuando(c.id); setPaso(3) }}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="guiado__nav">
            <button type="button" className="boton-grande boton-grande--secundario" aria-label="Atrás: volver al paso anterior" onClick={() => setPaso(1)}><span aria-hidden="true">←</span> Atrás</button>
          </div>
        </div>
      ) : null}

      {paso === 3 && elegido ? (
        <div className="guiado__paso">
          <h1>¿Está todo bien?</h1>
          <ul className="resumen-guiado">
            <li><span>Qué pasó</span><strong style={{ color: elegido.texto }}><elegido.Icono size={22} aria-hidden="true" style={{ verticalAlign: '-4px', marginRight: 6 }} />{elegido.guiado}</strong></li>
            <li><span>Dónde</span><strong>Lugar marcado en el mapa ✓</strong></li>
            <li><span>Cuándo</span><strong>{CUANDO.find((c) => c.id === cuando)?.label}</strong></li>
          </ul>
          {envio.error ? <div className="form-error" role="alert">{envio.error}</div> : null}
          <button
            type="button"
            className="boton-grande boton-grande--enviar"
            disabled={envio.enviando}
            onClick={() => envio.enviar({ tipo, modo: 'guiado', ubicacion, fecha: fechaDesde(cuando) })}
          >
            {envio.enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
          <button type="button" className="boton-grande boton-grande--secundario" aria-label="Atrás: volver al paso anterior" onClick={() => setPaso(2)}><span aria-hidden="true">←</span> Atrás</button>
        </div>
      ) : null}
    </section>
  )
}
