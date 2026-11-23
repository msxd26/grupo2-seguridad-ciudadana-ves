import { Link } from 'react-router-dom'
import { haceCuanto, tipoDe } from '../../models/tipos'
import { IconoAtencion, IconoInfo, IconoPeligro } from '../../models/iconos'

// El nivel se comunica con ícono + texto + color (WCAG 1.4.1).
const NIVELES = {
  alta: { label: 'Peligro', Icono: IconoPeligro },
  media: { label: 'Atención', Icono: IconoAtencion },
  informativa: { label: 'Info', Icono: IconoInfo },
}
const TIPOS = { incidente: 'Reporte vecinal', zona: 'Zona de riesgo', tendencia: 'Tendencia oficial', estacional: 'Estacional' }

export default function AlertaCard({ alerta, distancia }) {
  const nivel = NIVELES[alerta.nivel]
  const t = alerta.tipoIncidente ? tipoDe(alerta.tipoIncidente) : null
  return (
    <article className={`alerta alerta--${alerta.nivel}`}>
      <div className="alerta__meta">
        <span className={`alerta__nivel alerta__nivel--${alerta.nivel}`}>
          <nivel.Icono size={15} aria-hidden="true" /> {nivel.label}
        </span>
        <span className="alerta__tipo">{TIPOS[alerta.tipo]}</span>
        {alerta.fecha ? <span className="alerta__tipo">· {haceCuanto(alerta.fecha)}</span> : null}
        {alerta.esDemo ? <span className="badge-demo">DEMO</span> : null}
      </div>
      <h3 className="alerta__titulo">
        {t ? <t.Icono size={18} aria-hidden="true" style={{ color: t.texto, verticalAlign: '-3px', marginRight: 6 }} /> : null}
        {alerta.titulo}
      </h3>
      <p className="alerta__mensaje">{alerta.mensaje}</p>
      <div className="alerta__pie">
        <span>
          {alerta.fuente}
          {distancia !== undefined ? ` · a ${distancia < 1000 ? `${Math.round(distancia / 10) * 10} m` : `${(distancia / 1000).toFixed(1)} km`} de ti` : ''}
        </span>
        {alerta.lat ? <Link to={`/mapa?lat=${alerta.lat}&lng=${alerta.lng}`} aria-label={`Ver en el mapa: ${alerta.titulo}`}>Ver en el mapa <span aria-hidden="true">→</span></Link> : null}
      </div>
    </article>
  )
}
