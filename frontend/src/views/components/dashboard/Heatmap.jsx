import { useState } from 'react'
import { MESES, MESES_CORTOS, formatNumero } from '../../../models/estadisticas'

// Rampa secuencial de un solo tono (azul), de claro a oscuro.
const RAMPA = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b']
const TEXTO_CLARO_DESDE = 3 // índice desde el cual el texto va en blanco

// Matriz año × mes: muestra estacionalidad y meses atípicos de un vistazo.
export default function Heatmap({ serie, onSelectAnio }) {
  const [hover, setHover] = useState(null)
  const valores = serie.map((p) => p.total)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const indice = (v) => (max === min ? 3 : Math.min(RAMPA.length - 1, Math.floor(((v - min) / (max - min)) * RAMPA.length)))

  const anios = [...new Set(serie.map((p) => p.anio))]
  const porClave = new Map(serie.map((p) => [`${p.anio}-${p.mes}`, p]))

  return (
    <div className="heatmap">
      <div className="heatmap__scroll">
        <table className="heatmap__table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Año</span></th>
              {MESES_CORTOS.map((m) => <th key={m} scope="col">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {anios.map((anio) => (
              <tr key={anio}>
                <th scope="row">
                  <button type="button" className="heatmap__anio" onClick={() => onSelectAnio(anio)} title={`Filtrar ${anio}`}>
                    {anio}
                  </button>
                </th>
                {MESES_CORTOS.map((_, i) => {
                  const p = porClave.get(`${anio}-${i + 1}`)
                  if (!p) return <td key={i} className="heatmap__vacio" aria-label="Sin datos" />
                  const k = indice(p.total)
                  return (
                    <td
                      key={i}
                      style={{ background: RAMPA[k], color: k >= TEXTO_CLARO_DESDE ? '#fff' : '#0b0b0b' }}
                      onPointerEnter={() => setHover(p)}
                      onPointerLeave={() => setHover(null)}
                      title={`${MESES[i]} ${anio}: ${formatNumero(p.total)}`}
                    >
                      {p.total >= 1000 ? `${(p.total / 1000).toFixed(1)}k` : p.total}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="heatmap__footer">
        <div className="heatmap__legend" aria-hidden="true">
          <span>{formatNumero(min)}</span>
          {RAMPA.map((c) => <i key={c} style={{ background: c }} />)}
          <span>{formatNumero(max)}</span>
        </div>
        <span className="heatmap__hover">
          {hover ? `${MESES[hover.mes - 1]} ${hover.anio}: ${formatNumero(hover.total)} denuncias` : 'Pasa el cursor sobre una celda'}
        </span>
      </div>
    </div>
  )
}
