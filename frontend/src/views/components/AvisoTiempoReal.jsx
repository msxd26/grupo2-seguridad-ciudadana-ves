import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEventos } from '../../context/EventosContext'
import { tipoDe } from '../../models/tipos'
import { enlaceMapa, resumenTipos } from '../../models/avisos'

const DURACION = 8000
const MAXIMO = 3 // avisos individuales visibles a la vez
const VENTANA_RAFAGA = 10_000 // 3 o más reportes en 10 s = ráfaga
const UMBRAL_RAFAGA = 3

// Avisos en pantalla cuando un vecino reporta algo (en cualquier página).
// Uno o dos reportes se muestran por separado; una ráfaga se agrupa en UN aviso que se va actualizando.
export default function AvisoTiempoReal() {
  const { suscribir } = useEventos()
  const [avisos, setAvisos] = useState([])
  const [grupo, setGrupo] = useState(null) // { lista: [reportes] }
  const temporizadores = useRef(new Map())
  const recientes = useRef([]) // { t, r }
  const enRafaga = useRef(false)
  const grupoRef = useRef(null) // espejo de `grupo` para leerlo dentro del oyente

  const quitar = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id))
    temporizadores.current.delete(id)
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  const cerrarGrupo = useCallback(() => {
    clearTimeout(temporizadores.current.get('grupo'))
    temporizadores.current.delete('grupo')
    enRafaga.current = false
    grupoRef.current = null
    setGrupo(null)
  }, [])

  const programarCierreGrupo = useCallback((ms) => {
    clearTimeout(temporizadores.current.get('grupo'))
    temporizadores.current.set('grupo', setTimeout(cerrarGrupo, ms))
  }, [cerrarGrupo])

  useEffect(
    () =>
      suscribir((tipo, datos) => {
        if (tipo === 'rafaga') {
          if (datos.estado === 'iniciada') enRafaga.current = true
          if (datos.estado === 'terminada') programarCierreGrupo(DURACION + 4000)
          return
        }
        if (tipo !== 'reporte') return
        const ahora = Date.now()
        recientes.current = [...recientes.current.filter((x) => ahora - x.t < VENTANA_RAFAGA), { t: ahora, r: datos }]

        const agrupar = grupoRef.current || enRafaga.current || recientes.current.length >= UMBRAL_RAFAGA
        if (agrupar) {
          const base = grupoRef.current?.lista ?? recientes.current.map((x) => x.r)
          const lista = base.some((r) => r.id === datos.id) ? base : [...base, datos]
          grupoRef.current = { lista }
          setGrupo(grupoRef.current)
          // Los avisos individuales de esta ráfaga se funden en el grupo.
          const ids = new Set(lista.map((r) => r.id))
          ids.forEach((id) => { clearTimeout(temporizadores.current.get(id)); temporizadores.current.delete(id) })
          setAvisos((a) => a.filter((x) => !ids.has(x.id)))
          programarCierreGrupo(DURACION + 4000)
        } else {
          setAvisos((lista) => [datos, ...lista.filter((a) => a.id !== datos.id)].slice(0, MAXIMO))
          temporizadores.current.set(datos.id, setTimeout(() => quitar(datos.id), DURACION))
        }
      }),
    [suscribir, quitar, programarCierreGrupo],
  )

  useEffect(() => {
    const t = temporizadores.current
    return () => t.forEach(clearTimeout)
  }, [])

  if (!avisos.length && !grupo) return null

  return (
    <div className="avisos-vivo" role="status" aria-live="polite">
      {grupo ? (
        <div className="aviso-vivo aviso-vivo--grupo">
          <span className="aviso-vivo__icono" aria-hidden="true">{grupo.lista.length}</span>
          <div className="aviso-vivo__texto">
            <strong>{grupo.lista.length} reportes nuevos{grupo.lista.some((r) => r.esDemo) ? <span className="badge-demo">DEMO</span> : null}</strong>
            <span>{resumenTipos(grupo.lista)}</span>
          </div>
          <Link to={enlaceMapa(grupo.lista)} onClick={cerrarGrupo}>Ver en el mapa</Link>
          <button type="button" onClick={cerrarGrupo} aria-label="Cerrar aviso">×</button>
        </div>
      ) : null}
      {avisos.map((r) => {
        const t = tipoDe(r.tipo)
        const { Icono } = t
        return (
          <div key={r.id} className="aviso-vivo" style={{ '--color-tipo': t.color }}>
            <span className="aviso-vivo__icono" aria-hidden="true"><Icono size={20} /></span>
            <div className="aviso-vivo__texto">
              <strong>Nuevo reporte: {t.label}{r.esDemo ? <span className="badge-demo">DEMO</span> : null}</strong>
              <span>{r.referencia ?? 'Villa El Salvador'} · hace un momento</span>
            </div>
            <Link to={`/mapa?lat=${r.lat}&lng=${r.lng}`} onClick={() => quitar(r.id)}>Ver en el mapa</Link>
            <button type="button" onClick={() => quitar(r.id)} aria-label="Cerrar aviso">×</button>
          </div>
        )
      })}
    </div>
  )
}
