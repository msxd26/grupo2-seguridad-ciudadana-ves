import { useState } from 'react'
import { Link } from 'react-router-dom'
import { haceCuanto, tipoDe } from '../../models/tipos'
import { IconoAtencion, IconoInfo, IconoPeligro, IconoPin } from '../../models/iconos'

// El nivel se comunica con ícono + texto + color (WCAG 1.4.1: nunca solo color).
const NIVELES = {
  alta:        { label: 'Peligro',   Icono: IconoPeligro },
  media:       { label: 'Atención',  Icono: IconoAtencion },
  informativa: { label: 'Info',      Icono: IconoInfo },
}

// "Esto pasó ahora" (reporte) se distingue de "esto es un análisis" (zona/tendencia/estacional).
export const TIPOS_ALERTA = {
  incidente:  'Reporte vecinal',
  zona:       'Zona de riesgo',
  tendencia:  'Tendencia oficial',
  estacional: 'Estacional',
}

const formatoDistancia = (d) =>
  d < 1000 ? `${Math.round(d / 10) * 10} m` : `${(d / 1000).toFixed(1)} km`

// Número de caracteres a partir del cual se trunca el mensaje.
const LIMITE_MENSAJE = 160

export default function AlertaCard({ alerta, distancia }) {
  const [expandido, setExpandido] = useState(false)
  const nivel = NIVELES[alerta.nivel]
  const t = alerta.tipoIncidente ? tipoDe(alerta.tipoIncidente) : null
  const mensajeLargo = alerta.mensaje?.length > LIMITE_MENSAJE
  const mensajeVisible = mensajeLargo && !expandido
    ? `${alerta.mensaje.slice(0, LIMITE_MENSAJE).trimEnd()}…`
    : alerta.mensaje

  // Ruta para "Reportar algo parecido": precarga el tipo detectado.
  const urlReportarIgual = t ? `/reportar?tipo=${alerta.tipoIncidente}` : '/reportar'

  return (
    <article className={`alerta alerta--${alerta.nivel} alerta--${alerta.tipo}`}>
      {/* ── Cabecera: nivel + clase + timestamp ── */}
      <div className="alerta__cabecera">
        <div className="alerta__badges">
          <span className={`alerta__nivel alerta__nivel--${alerta.nivel}`}>
            <nivel.Icono size={15} aria-hidden="true" /> {nivel.label}
          </span>
          <span className={`alerta__clase alerta__clase--${alerta.tipo}`}>
            {TIPOS_ALERTA[alerta.tipo]}
          </span>
          {alerta.esDemo ? <span className="badge-demo">DEMO</span> : null}
        </div>
        {alerta.fecha ? (
          <time className="alerta__hora" dateTime={alerta.fecha} title={new Date(alerta.fecha).toLocaleString('es-PE')}>
            {haceCuanto(alerta.fecha)}
          </time>
        ) : null}
      </div>

      {/* ── Título con icono de tipo de incidente ── */}
      <h3 className="alerta__titulo">
        {t ? <t.Icono size={20} aria-hidden="true" style={{ color: t.texto, flexShrink: 0 }} /> : null}
        <span>{alerta.titulo}</span>
      </h3>

      {/* ── Ubicación: zona/referencia si existe ── */}
      {alerta.referencia ? (
        <p className="alerta__zona">
          <IconoPin size={13} aria-hidden="true" />
          {alerta.referencia}
        </p>
      ) : null}

      {/* ── Mensaje con truncado y "Ver más" (cuerpo 1rem = 16px, ODS 10) ── */}
      {alerta.mensaje ? (
        <p className="alerta__mensaje">
          {mensajeVisible}
          {mensajeLargo ? (
            <button
              type="button"
              className="alerta__ver-mas"
              aria-expanded={expandido}
              onClick={() => setExpandido((v) => !v)}
            >
              {expandido ? ' Ver menos' : ' Ver más'}
            </button>
          ) : null}
        </p>
      ) : null}

      {/* ── Pie: distancia + fuente + acciones ── */}
      <div className="alerta__pie">
        <span className="alerta__fuente">
          {distancia !== undefined ? (
            <><IconoPin size={13} aria-hidden="true" /> a {formatoDistancia(distancia)} de ti</>
          ) : (
            alerta.fuente
          )}
        </span>

        <div className="alerta__acciones">
          {alerta.lat ? (
            <Link
              to={`/mapa?lat=${alerta.lat}&lng=${alerta.lng}`}
              className="alerta__accion"
              aria-label={`Ver en el mapa: ${alerta.titulo}`}
            >
              Ver en el mapa <span aria-hidden="true">→</span>
            </Link>
          ) : null}

          {/* "Reportar algo parecido" solo en incidentes veccinales (no en análisis oficiales) */}
          {alerta.tipo === 'incidente' && t ? (
            <Link
              to={urlReportarIgual}
              className="alerta__accion alerta__accion--secundaria"
              aria-label={`Reportar un incidente parecido: ${t.label}`}
            >
              Reportar igual
            </Link>
          ) : null}

          {/* Análisis oficial: acceso directo al dashboard */}
          {(alerta.tipo === 'tendencia' || alerta.tipo === 'estacional') ? (
            <Link
              to="/dashboard"
              className="alerta__accion alerta__accion--secundaria"
              aria-label="Ver estadísticas completas en el panel municipal"
            >
              Ver estadísticas <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
