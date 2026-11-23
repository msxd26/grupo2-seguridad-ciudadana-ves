import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useEnviarReporte } from '../../../controllers/useEnviarReporte'
import { useLimite } from '../../../controllers/useLimite'
import { TIPOS } from '../../../models/tipos'
import UbicacionSelector from '../../components/reporte/UbicacionSelector'
import ReporteEnviado from '../../components/reporte/ReporteEnviado'
import '../../../assets/styles/reportar.css'

const MAX_DESC = 500

function ahoraLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// Modo 1: formulario clásico (plan: chips de tipo + descripción + ubicación).
export default function ReportarFormularioPage() {
  const { usuario } = useAuth()
  const limite = useLimite()
  const envio = useEnviarReporte()
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [fecha, setFecha] = useState(ahoraLocal)
  const [ubicacion, setUbicacion] = useState(null)
  const [errores, setErrores] = useState({})

  if (envio.enviado) {
    return (
      <section className="reportar container">
        <ReporteEnviado reporte={envio.enviado} onOtro={() => { envio.reiniciar(); setTipo(''); setDescripcion(''); setReferencia(''); setUbicacion(null); setFecha(ahoraLocal()) }} />
      </section>
    )
  }

  const enviar = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!tipo) errs.tipo = 'Elige qué tipo de incidente fue'
    if (descripcion.trim().length < 10) errs.descripcion = 'Describe lo ocurrido (mínimo 10 caracteres)'
    if (!ubicacion) errs.ubicacion = 'Marca dónde ocurrió'
    if (!fecha || new Date(fecha) > new Date()) errs.fechaHecho = 'Indica una fecha y hora válidas'
    setErrores(errs)
    if (Object.keys(errs).length) return
    await envio.enviar({ tipo, modo: 'formulario', descripcion, referencia, ubicacion, fecha: new Date(fecha) })
  }
  const err = { ...errores, ...envio.errores }

  return (
    <section className="reportar container">
      <Link to="/reportar" className="volver">← Cambiar forma de reportar</Link>
      <header className="reportar__header">
        <h1>Reportar incidente</h1>
        <p>
          {usuario
            ? <>Quedará en <Link to="/mi-cuenta">tu historial</Link>. En el mapa público se muestra sin tu nombre.</>
            : <>Reporte <strong>anónimo</strong>: no pedimos nombre, DNI ni teléfono.</>}
        </p>
      </header>

      <form className="form-reporte" onSubmit={enviar} noValidate>
        <div className="form-reporte__columna">
          <fieldset className="campo">
            <legend>Tipo de incidente *</legend>
            <div className="chips-tipo">
              {TIPOS.map(({ id, label, color, Icono }) => (
                <button
                  key={id}
                  type="button"
                  className={tipo === id ? 'chip-tipo chip-tipo--activo' : 'chip-tipo'}
                  style={{ '--color-tipo': color }}
                  aria-pressed={tipo === id}
                  onClick={() => { setTipo(id); setErrores((x) => ({ ...x, tipo: undefined })) }}
                >
                  <Icono size={20} aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
            {err.tipo ? <span className="campo__error">{err.tipo}</span> : null}
          </fieldset>

          <div className="campo">
            <label htmlFor="f-desc">¿Qué ocurrió? *</label>
            <textarea id="f-desc" rows={4} maxLength={MAX_DESC} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej.: Dos personas en moto robaron un celular a la salida del paradero." aria-invalid={Boolean(err.descripcion)} />
            <span className="campo__ayuda">{descripcion.length}/{MAX_DESC} · No incluyas datos personales.</span>
            {err.descripcion ? <span className="campo__error">{err.descripcion}</span> : null}
          </div>

          <div className="form-reporte__fila">
            <div className="campo">
              <label htmlFor="f-fecha">¿Cuándo? *</label>
              <input id="f-fecha" type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-invalid={Boolean(err.fechaHecho)} />
              {err.fechaHecho ? <span className="campo__error">{err.fechaHecho}</span> : null}
            </div>
            <div className="campo">
              <label htmlFor="f-ref">Referencia (opcional)</label>
              <input id="f-ref" maxLength={200} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej.: Av. Revolución con Av. Central" />
            </div>
          </div>

          {envio.error && !Object.keys(envio.errores).length ? <div className="form-error" role="alert">{envio.error}</div> : null}

          <button type="submit" className="btn btn--alert boton-enviar" disabled={envio.enviando}>
            {envio.enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>

        <div className="form-reporte__columna">
          <span className="campo__label">¿Dónde ocurrió? *</span>
          <UbicacionSelector limite={limite} valor={ubicacion} onCambiar={(u) => { setUbicacion(u); setErrores((x) => ({ ...x, ubicacion: undefined })) }} error={err.ubicacion} />
        </div>
      </form>
    </section>
  )
}
