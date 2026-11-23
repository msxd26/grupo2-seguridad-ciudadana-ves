import { Link } from 'react-router-dom'

const NIVELES = {
  alta: { label: 'Alta', icono: '▲' },
  media: { label: 'Media', icono: '■' },
  informativa: { label: 'Informativa', icono: 'i' },
}
const TIPOS = { zona: 'Zona de riesgo', tendencia: 'Tendencia oficial', estacional: 'Estacional' }

export default function AlertaCard({ alerta }) {
  const nivel = NIVELES[alerta.nivel]
  return (
    <article className={`alerta alerta--${alerta.nivel}`}>
      <div className="alerta__meta">
        <span className={`alerta__nivel alerta__nivel--${alerta.nivel}`}>
          <span aria-hidden="true">{nivel.icono}</span> {nivel.label}
        </span>
        <span className="alerta__tipo">{TIPOS[alerta.tipo]}</span>
        {alerta.esDemo ? <span className="badge-demo">DEMO</span> : null}
      </div>
      <h3 className="alerta__titulo">{alerta.titulo}</h3>
      <p className="alerta__mensaje">{alerta.mensaje}</p>
      <div className="alerta__pie">
        <span>Fuente: {alerta.fuente}</span>
        {alerta.lat ? <Link to={`/mapa?lat=${alerta.lat}&lng=${alerta.lng}`}>Ver en el mapa →</Link> : null}
      </div>
    </article>
  )
}
