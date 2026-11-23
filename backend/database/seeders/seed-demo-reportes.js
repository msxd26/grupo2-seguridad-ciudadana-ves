// Genera reportes ciudadanos DE DEMOSTRACIÓN (es_demo = 1) para probar el mapa y las alertas.
// No son datos reales: la interfaz los marca como "Demo".
//   npm run db:demo          → crea los reportes demo (reemplaza los anteriores)
//   npm run db:demo:limpiar  → elimina todos los reportes demo
import { pool } from '../../src/config/db.js'
import { LIMITE_VES, puntoEnPoligono } from '../../src/utils/geo.js'

const SOLO_LIMPIAR = process.argv.includes('--limpiar')
const CANTIDAD = 90
const DIAS = 45

// Pesos aproximados según la distribución oficial de modalidades en VES.
const TIPOS = [
  ['Robo', 22], ['Hurto', 26], ['Violencia contra la mujer', 18], ['Extorsión', 6],
  ['Estafa', 6], ['Microcomercialización de drogas', 6], ['Pandillaje', 6],
  ['Alumbrado o zona insegura', 6], ['Consumo de alcohol en vía pública', 4],
]
// Algunos focos para que se formen zonas de concentración.
const FOCOS = [
  [-12.2131, -76.9379], [-12.2010, -76.9445], [-12.2265, -76.9300], [-12.2180, -76.9550],
]

// Generador pseudoaleatorio con semilla: los datos demo son reproducibles.
let semilla = 20261123
const azar = () => ((semilla = (semilla * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)

const totalPeso = TIPOS.reduce((acc, [, p]) => acc + p, 0)
function tipoAleatorio() {
  let r = azar() * totalPeso
  for (const [tipo, peso] of TIPOS) if ((r -= peso) < 0) return tipo
  return TIPOS[0][0]
}

const [minLng, minLat, maxLng, maxLat] = LIMITE_VES.bbox
function puntoAleatorio() {
  for (;;) {
    let lat, lng
    if (azar() < 0.55) {
      const [flat, flng] = FOCOS[Math.floor(azar() * FOCOS.length)]
      lat = flat + (azar() - 0.5) * 0.006
      lng = flng + (azar() - 0.5) * 0.006
    } else {
      lat = minLat + azar() * (maxLat - minLat)
      lng = minLng + azar() * (maxLng - minLng)
    }
    if (puntoEnPoligono(lat, lng)) return [lat, lng]
  }
}

try {
  await pool.query('DELETE FROM reportes WHERE es_demo = 1')
  if (SOLO_LIMPIAR) {
    console.log('✔ Reportes demo eliminados')
  } else {
    const ahora = Date.now()
    const filas = Array.from({ length: CANTIDAD }, () => {
      const [lat, lng] = puntoAleatorio()
      // Más reportes en días recientes.
      const fecha = new Date(ahora - azar() ** 1.6 * DIAS * 86_400_000)
      return [
        tipoAleatorio(),
        'Reporte de demostración generado automáticamente.',
        null,
        lat.toFixed(6),
        lng.toFixed(6),
        fecha,
        azar() < 0.6 ? 'verificado' : 'pendiente',
        1,
      ]
    })
    await pool.query(
      `INSERT INTO reportes (tipo, descripcion, referencia, lat, lng, fecha_hecho, estado, es_demo) VALUES ?`,
      [filas],
    )
    console.log(`✔ ${CANTIDAD} reportes DEMO creados (marcados con es_demo = 1)`)
  }
} finally {
  await pool.end()
}
