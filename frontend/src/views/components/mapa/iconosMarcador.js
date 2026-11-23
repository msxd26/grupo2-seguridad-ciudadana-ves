import L from 'leaflet'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TIPOS, tipoDe } from '../../../models/tipos'

// Marcadores con ícono + color (WCAG 1.4.1: el tipo no se comunica solo con color).
// El SVG de cada tipo se genera una sola vez al cargar el módulo y los divIcon se
// reutilizan desde una caché: el mapa sigue fluido aunque haya cientos de puntos.
const SVG_POR_TIPO = new Map(
  TIPOS.map((t) => [t.id, renderToStaticMarkup(createElement(t.Icono, { size: 14, color: '#fff', strokeWidth: 2.5, 'aria-hidden': true }))]),
)

const cache = new Map()

export function iconoMarcador(tipoId, { nuevo = false, verificado = false } = {}) {
  const tipo = tipoDe(tipoId)
  const clave = `${tipo.id}|${nuevo}|${verificado}`
  if (cache.has(clave)) return cache.get(clave)

  const tamano = nuevo ? 30 : 24
  const clases = ['marcador', nuevo && 'marcador--nuevo', verificado && 'marcador--verificado'].filter(Boolean).join(' ')
  const icono = L.divIcon({
    className: 'marcador-wrap',
    html: `<span class="${clases}" style="--color-tipo:${tipo.color}">${SVG_POR_TIPO.get(tipo.id)}</span>`,
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
    popupAnchor: [0, -tamano / 2],
  })
  cache.set(clave, icono)
  return icono
}
