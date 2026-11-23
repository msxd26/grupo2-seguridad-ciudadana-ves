import { Rectangle, Tooltip } from 'react-leaflet'

// Colores y patrones de la escala divergente (distintos al semáforo de peligro existente).
// WCAG 1.4.1: nunca solo color — cada nivel tiene un símbolo textual en el tooltip.
const NIVELES_BRECHA = {
  alta:              { color: '#DC2626', fillColor: '#FEE2E2', fillOpacity: 0.75, simbolo: '▲', label: 'Alta diferencia' },
  media:             { color: '#C2410C', fillColor: '#FEF3C7', fillOpacity: 0.65, simbolo: '■', label: 'Diferencia media' },
  similar:           { color: '#94A3B8', fillColor: '#F1F5F9', fillOpacity: 0.45, simbolo: '—', label: 'Similar' },
  mas_oficial:       { color: '#1D4ED8', fillColor: '#DBEAFE', fillOpacity: 0.55, simbolo: '▼', label: 'Más en oficial' },
  sin_equivalente:   { color: '#7C3AED', fillColor: '#EDE9FE', fillOpacity: 0.70, simbolo: '✕', label: 'Sin registro oficial' },
}

function TarjetaBrechaTooltip({ zona }) {
  const { vecinal, oficial, brecha } = zona
  const nivel = NIVELES_BRECHA[brecha.nivel] ?? NIVELES_BRECHA.similar

  const etiquetasTipo = {
    robo: 'Robo', intento_robo: 'Intento de robo', acoso: 'Acoso',
    actividad_sospechosa: 'Actividad sospechosa', zona_oscura: 'Zona oscura',
    espacio_abandonado: 'Espacio abandonado', otro: 'Otro',
  }

  return (
    <div className="tarjeta-brecha" role="dialog" aria-label="Comparación de fuentes en esta zona">
      <div className="tarjeta-brecha__cabecera">
        <span className={`tarjeta-brecha__nivel tarjeta-brecha__nivel--${brecha.nivel}`}>
          <span aria-hidden="true">{nivel.simbolo}</span> {nivel.label}
        </span>
      </div>

      <div className="tarjeta-brecha__filas">
        <div className="tarjeta-brecha__fila tarjeta-brecha__fila--vecinal">
          <span className="tarjeta-brecha__fuente-label">🏘️ Vecinos</span>
          <strong className="tarjeta-brecha__cifra">{vecinal.total}</strong>
          <span className="tarjeta-brecha__tipo">{etiquetasTipo[vecinal.tipoPrincipal] ?? vecinal.tipoPrincipal}</span>
        </div>
        <div className="tarjeta-brecha__fila tarjeta-brecha__fila--oficial">
          <span className="tarjeta-brecha__fuente-label">🏛️ Oficial (est.)</span>
          <strong className="tarjeta-brecha__cifra">{oficial.estimado ?? '—'}</strong>
          <span className="tarjeta-brecha__tipo">{oficial.tipoPrincipal ? etiquetasTipo[oficial.tipoPrincipal] ?? oficial.tipoPrincipal : 'Sin equivalente'}</span>
        </div>
      </div>

      <p className="tarjeta-brecha__explicacion">{brecha.explicacion}</p>

      {brecha.confianza === 'sin_equivalente_oficial' ? (
        <p className="tarjeta-brecha__aviso">
          Este tipo de incidente no tiene equivalente en las estadísticas policiales.
        </p>
      ) : (
        <p className="tarjeta-brecha__aviso">
          Dato oficial: estimación proporcional sobre totales SIDPOL por distrito.
        </p>
      )}
    </div>
  )
}

// Capa de rectángulos sobre el mapa de Leaflet coloreados por nivel de brecha.
export default function CapaBrecha({ zonas = [] }) {
  if (!zonas.length) return null

  return zonas.map((zona) => {
    const nivel = NIVELES_BRECHA[zona.brecha.nivel] ?? NIVELES_BRECHA.similar
    const bounds = [[zona.sur, zona.oeste], [zona.norte, zona.este]]

    return (
      <Rectangle
        key={zona.id}
        bounds={bounds}
        pathOptions={{
          color: nivel.color,
          weight: 2,
          fillColor: nivel.fillColor,
          fillOpacity: nivel.fillOpacity,
        }}
        // aria no está disponible en SVG nativo de Leaflet pero el Tooltip es accesible
      >
        <Tooltip sticky className="tooltip-brecha" direction="top">
          <TarjetaBrechaTooltip zona={zona} />
        </Tooltip>
      </Rectangle>
    )
  })
}
