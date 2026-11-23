import { Link } from 'react-router-dom'
import { haceCuanto, tipoDe } from '../../models/tipos'
import { IconoAtencion, IconoInfo, IconoPeligro, IconoPin } from '../../models/iconos'

// El nivel se comunica con ícono + texto + color (WCAG 1.4.1).
const NIVELES = {
  alta: { label: 'Peligro', Icono: IconoPeligro },
  media: { label: 'Atención', Icono: IconoAtencion },
  informativa: { label: 'Info', Icono: IconoInfo },
}
// "Esto pasó ahora" (reporte) se distingue de "esto es un análisis" (zona/tendencia/estacional).
export const TIPOS_ALERTA = {
  incidente: 'Reporte vecinal',
  zona: 'Zona de riesgo',
  tendencia: 'Tendencia oficial',
  estacional: 'Estacional',
}

const formatoDistancia = (d) => (d < 1000 ? `${Math.round(d / 10) * 10} m` : `${(d / 1000).toFixed(1)} km`)

export default function AlertaCard({ alerta, distancia }) {
  const nivel = NIVELES[alerta.nivel]
  const t = alerta.tipoIncidente ? tipoDe(alerta.tipoIncidente) : null
  return (
    <article className={`alerta alerta--${alerta.nivel} alerta--${alerta.tipo}`}>
      <div className="alerta__cabecera">
        <div className="alerta__badges">
          <span className={`alerta__nivel alerta__nivel--${alerta.nivel}`}>
            <nivel.Icono size={15} aria-hidden="true" /> {nivel.label}
          </span>
          <span className={`alerta__clase alerta__clase--${alerta.tipo}`}>{TIPOS_ALERTA[alerta.tipo]}</span>
          {alerta.esDemo ? <span className="badge-demo">DEMO</span> : null}
        </div>
        {alerta.fecha ? <time className="alerta__hora" dateTime={alerta.fecha}>{haceCuanto(alerta.fecha)}</time> : null}
      </div>
      <h3 className="alerta__titulo">
        {t ? <t.Icono size={20} aria-hidden="true" style={{ color: t.texto, flexShrink: 0 }} /> : null}
        <span>{alerta.titulo}</span>
      </h3>
      <p className="alerta__mensaje">{alerta.mensaje}</p>
      <div className="alerta__pie">
        <span className="alerta__fuente">
          {distancia !== undefined ? (
            <><IconoPin size={14} aria-hidden="true" /> a {formatoDistancia(distancia)} de ti</>
          ) : alerta.fuente}
        </span>
        {alerta.lat ? (
          <Link to={`/mapa?lat=${alerta.lat}&lng=${alerta.lng}`} aria-label={`Ver en el mapa: ${alerta.titulo}`}>
            Ver en el mapa <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}
