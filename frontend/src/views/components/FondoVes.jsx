import { useId } from 'react'
import { SILUETA_VES } from '../../models/siluetaVes'
import '../../assets/styles/fondo-ves.css'

// Fondo decorativo que alude a Villa El Salvador:
// - Trama del plano urbano autogestionado: cada "grupo residencial" son 16 manzanas
//   alrededor de un parque central, separados por avenidas.
// - Silueta real del distrito (límite OSM) con puntos de reportes que laten.
// - Dunas del Lomo de Corvina y las olas del litoral del Pacífico.
// Es puramente decorativo (aria-hidden); los colores salen de `currentColor`.
const MANZANAS = []
for (let f = 0; f < 4; f++) {
  for (let c = 0; c < 4; c++) {
    if ((f === 1 || f === 2) && (c === 1 || c === 2)) continue // parque central
    MANZANAS.push([8 + c * 22, 8 + f * 22])
  }
}

export default function FondoVes({ variante = 'azul', extra = '', silueta = true, costa = true, puntos = true }) {
  const id = `ves-grupo-${useId().replace(/:/g, '')}`
  return (
    <div className={`fondo-ves fondo-ves--${variante} ${extra}`.trim()} aria-hidden="true">
      <svg className="fondo-ves__trama" width="100%" height="100%" focusable="false">
        <defs>
          <pattern id={id} width="104" height="104" patternUnits="userSpaceOnUse">
            {MANZANAS.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="18" height="18" rx="2" />
            ))}
            <rect className="fondo-ves__parque" x="31" y="31" width="40" height="40" rx="4" />
            <circle className="fondo-ves__parque" cx="51" cy="51" r="7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>

      {silueta ? (
        <svg className="fondo-ves__silueta" viewBox={SILUETA_VES.viewBox} focusable="false">
          <path className="fondo-ves__distrito" d={SILUETA_VES.d} />
          {puntos
            ? SILUETA_VES.puntos.map(([x, y], i) => (
                <g key={i} className="fondo-ves__punto" style={{ '--retraso': `${i * 0.7}s` }}>
                  <circle className="fondo-ves__onda" cx={x} cy={y} r="16" />
                  <circle cx={x} cy={y} r="11" />
                </g>
              ))
            : null}
        </svg>
      ) : null}

      {costa ? (
        <svg className="fondo-ves__costa" viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false">
          <path className="fondo-ves__duna" d="M0 70 C 180 20 330 30 480 62 S 760 96 930 52 S 1250 18 1440 58 V120 H0Z" />
          <path className="fondo-ves__ola" d="M0 96 C 120 82 240 82 360 96 S 600 110 720 96 S 960 82 1080 96 S 1320 110 1440 96 V120 H0Z" />
        </svg>
      ) : null}
    </div>
  )
}
