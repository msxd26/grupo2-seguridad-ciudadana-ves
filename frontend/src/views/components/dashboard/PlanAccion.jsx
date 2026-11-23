import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlanDecisiones } from '../../../controllers/usePlanDecisiones'
import { IconoAceptar, IconoDescartar, IconoEditar, IconoIA, IconoReglas } from '../../../models/iconos'

const PRIORIDAD = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' }
const ESTADO = { aceptada: 'Aceptada', descartada: 'Descartada' }

function EdicionAccion({ accion, inicial, onGuardar, onCancelar }) {
  const [valores, setValores] = useState({ titulo: inicial.titulo, responsable: inicial.responsable, plazo: inicial.plazo })
  const campo = (k, label) => (
    <label className="plan-edicion__campo">
      <span>{label}</span>
      <input value={valores[k]} maxLength={160} onChange={(e) => setValores((v) => ({ ...v, [k]: e.target.value }))} />
    </label>
  )
  return (
    <form
      className="plan-edicion"
      onSubmit={(e) => { e.preventDefault(); onGuardar(valores) }}
      aria-label={`Editar la acción: ${accion.titulo}`}
    >
      {campo('titulo', 'Acción')}
      {campo('responsable', 'Responsable')}
      {campo('plazo', 'Plazo')}
      <div className="plan-edicion__botones">
        <button type="submit" className="plan-btn plan-btn--primario" disabled={!valores.titulo.trim()}>Guardar y aceptar</button>
        <button type="button" className="plan-btn" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  )
}

function Accion({ accion, decision, acciones }) {
  const [editando, setEditando] = useState(false)
  const vista = { ...accion, ...decision?.edicion }
  const estado = decision?.estado
  return (
    <li className={`plan-accion plan-accion--${estado ?? 'pendiente'}`}>
      <div className="plan-accion__cabecera">
        <span className={`prioridad prioridad--${accion.prioridad}`}>{PRIORIDAD[accion.prioridad]}</span>
        {estado ? <span className={`plan-accion__estado plan-accion__estado--${estado}`}>{ESTADO[estado]}{decision.edicion ? ' (editada)' : ''}</span> : null}
      </div>
      {editando ? (
        <EdicionAccion
          accion={accion}
          inicial={vista}
          onGuardar={(edicion) => { acciones.editar(accion.id, edicion); setEditando(false) }}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <strong className="plan-accion__titulo">{vista.titulo}</strong>
          <dl className="plan-accion__datos">
            <div><dt>Responsable</dt><dd>{vista.responsable}</dd></div>
            <div><dt>Plazo</dt><dd>{vista.plazo}</dd></div>
            <div><dt>Recurso</dt><dd>{accion.recurso}</dd></div>
            <div><dt>Impacto esperado</dt><dd>{accion.impacto}</dd></div>
          </dl>
          <p className="plan-accion__porque"><strong>¿Por qué?</strong> {accion.porque}.</p>
          <div className="plan-accion__botones">
            {estado ? (
              <button type="button" className="plan-btn" onClick={() => acciones.deshacer(accion.id)}>Deshacer</button>
            ) : (
              <>
                <button type="button" className="plan-btn plan-btn--aceptar" onClick={() => acciones.aceptar(accion.id)}>
                  <IconoAceptar size={16} aria-hidden="true" /> Aceptar
                </button>
                <button type="button" className="plan-btn" onClick={() => setEditando(true)}>
                  <IconoEditar size={16} aria-hidden="true" /> Editar
                </button>
                <button type="button" className="plan-btn plan-btn--descartar" onClick={() => acciones.descartar(accion.id)}>
                  <IconoDescartar size={16} aria-hidden="true" /> Descartar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </li>
  )
}

// Plan de acción recomendado: la IA (o las reglas) proponen; el funcionario acepta, edita o descarta.
export default function PlanAccion({ plan, error, cargando }) {
  const acciones = usePlanDecisiones()
  const { decisiones } = acciones

  if (error) return <div className="pbi__error" role="alert">No se pudo generar el plan: {error}</div>
  if (!plan) {
    return (
      <div role="status" className="plan-cargando">
        <p className="cargando-texto"><span className="spinner" aria-hidden="true" /> Preparando el plan de acción…</p>
      </div>
    )
  }
  if (!plan.zonas.length) {
    return <p className="tile__nota">Aún no hay zonas con datos suficientes para proponer acciones. Cuando haya más reportes, el plan aparecerá aquí.</p>
  }

  const todas = plan.zonas.flatMap((z) => z.acciones)
  const cuenta = (e) => todas.filter((a) => decisiones[a.id]?.estado === e).length
  const aceptadas = cuenta('aceptada')
  const descartadas = cuenta('descartada')

  return (
    <div className={cargando ? 'plan plan--cargando' : 'plan'}>
      <p className="plan__resumen" aria-live="polite">
        <strong>{aceptadas}</strong> aceptadas · <strong>{descartadas}</strong> descartadas · <strong>{todas.length - aceptadas - descartadas}</strong> por decidir
        <span className="plan__nota"> · Las decisiones se guardan en este navegador.</span>
      </p>
      <div className="plan__zonas">
        {plan.zonas.map((z, i) => (
          <section key={z.id} className={`plan-zona plan-zona--${z.prioridad}`} aria-labelledby={`plan-${z.id}`}>
            <header className="plan-zona__cabecera">
              <span className="plan-zona__rango">{i + 1}</span>
              <div>
                <h4 id={`plan-${z.id}`}>{z.nombre}</h4>
                <span className={z.redactadoPor === 'ia' ? 'redactado redactado--ia' : 'redactado'}>
                  {z.redactadoPor === 'ia'
                    ? <><IconoIA size={14} aria-hidden="true" /> Justificación redactada por IA con los datos calculados</>
                    : <><IconoReglas size={14} aria-hidden="true" /> Propuesta por reglas a partir de los datos</>}
                </span>
              </div>
              <Link className="plan-zona__mapa" to={`/mapa?lat=${z.centro.lat}&lng=${z.centro.lng}`}>Ver en el mapa →</Link>
            </header>
            <p className="plan-zona__justificacion">{z.justificacion}</p>
            <ol className="plan-zona__acciones">
              {z.acciones.map((a) => <Accion key={a.id} accion={a} decision={decisiones[a.id]} acciones={acciones} />)}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
