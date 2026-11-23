import { UBIGEO_VES, nombreModalidadCorto } from '../../../models/estadisticas'

// Panel de segmentación de datos (slicers): distrito, periodo y modalidades.
export default function SlicerPanel({ catalogos, filtros, seleccionadas, acciones, abierto, onCerrar }) {
  const anios = catalogos.periodos.map((p) => p.anio)
  const ultimo = anios.at(-1)
  const primero = anios[0]
  const { desde, hasta } = filtros

  const rapidos = [
    { label: 'Último año', d: ultimo, h: ultimo },
    { label: '3 años', d: Math.max(primero, ultimo - 2), h: ultimo },
    { label: '5 años', d: Math.max(primero, ultimo - 4), h: ultimo },
    { label: 'Todo', d: primero, h: ultimo },
  ]

  return (
    <aside className={abierto ? 'slicers slicers--abierto' : 'slicers'} aria-label="Filtros del panel">
      <div className="slicers__head">
        <h2>Filtros</h2>
        <button type="button" className="slicers__cerrar" onClick={onCerrar} aria-label="Cerrar filtros">×</button>
      </div>

      <div className="slicer">
        <label className="slicer__label" htmlFor="f-distrito">Distrito</label>
        <select
          id="f-distrito"
          className="slicer__select"
          value={filtros.distrito.ubigeo}
          onChange={(e) => acciones.setDistrito(e.target.value === UBIGEO_VES ? null : e.target.value)}
        >
          {catalogos.distritos.map((d) => (
            <option key={d.ubigeo} value={d.ubigeo}>{d.nombre}</option>
          ))}
        </select>
      </div>

      <div className="slicer">
        <span className="slicer__label">Periodo</span>
        <div className="slicer__rango">
          <select aria-label="Desde" className="slicer__select" value={desde} onChange={(e) => acciones.setRango(e.target.value, Math.max(Number(e.target.value), hasta))}>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <span>a</span>
          <select aria-label="Hasta" className="slicer__select" value={hasta} onChange={(e) => acciones.setRango(Math.min(desde, Number(e.target.value)), e.target.value)}>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="slicer__chips">
          {rapidos.map((r) => (
            <button
              key={r.label}
              type="button"
              className={r.d === desde && r.h === hasta ? 'chip chip--activo' : 'chip'}
              onClick={() => acciones.setRango(r.d, r.h)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="slicer">
        <legend className="slicer__label">Modalidad</legend>
        <ul className="slicer__checks">
          {catalogos.modalidades.map((m) => (
            <li key={m.id}>
              <label>
                <input type="checkbox" checked={seleccionadas.includes(m.id)} onChange={() => acciones.toggleModalidad(m.id)} />
                {nombreModalidadCorto(m.nombre)}
              </label>
            </li>
          ))}
        </ul>
        <p className="slicer__hint">Sin selección = todas las modalidades.</p>
      </fieldset>

      <button type="button" className="slicers__limpiar" onClick={acciones.limpiar}>
        Restablecer filtros
      </button>

      <p className="slicers__tip">
        Consejo: haz clic en una barra, columna o distrito de los gráficos para filtrar todo el panel.
      </p>
    </aside>
  )
}
