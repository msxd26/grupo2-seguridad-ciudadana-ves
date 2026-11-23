// Genera reportes ciudadanos DE DEMOSTRACIÓN (es_demo = 1) para la demo de Tu Vecino.
// No son datos reales: la interfaz los marca como "DEMO".
//   npm run db:demo          → crea los reportes demo (reemplaza los anteriores)
//   npm run db:demo:limpiar  → elimina todos los reportes demo
import { pool } from '../../src/config/db.js'
import { crearAzar, generarReporteDemo } from '../../src/utils/demo.js'

const SOLO_LIMPIAR = process.argv.includes('--limpiar')
const CANTIDAD = 72
const DIAS = 10 // la mayoría cae en los últimos 7 días (checklist pre-demo del plan)

const azar = crearAzar(20261123) // semilla fija: la demo es reproducible

// Más reportes en días recientes y de noche (18:00–02:00), como en la realidad.
function fechaAleatoria() {
  const fecha = new Date(Date.now() - azar() ** 1.5 * DIAS * 86_400_000)
  if (azar() < 0.6) fecha.setHours((18 + Math.floor(azar() * 8)) % 24, Math.floor(azar() * 60))
  return fecha > new Date() ? new Date(Date.now() - azar() * 3_600_000) : fecha
}

try {
  await pool.query('DELETE FROM reportes WHERE es_demo = 1')
  if (SOLO_LIMPIAR) {
    console.log('✔ Reportes demo eliminados')
  } else {
    const filas = Array.from({ length: CANTIDAD }, () => {
      const r = generarReporteDemo(azar, fechaAleatoria())
      return [r.tipo, r.modo, r.iaConfianza, r.iaCorregido ? 1 : 0, r.descripcion, r.referencia, r.lat, r.lng, r.fechaHecho, azar() < 0.55 ? 'verificado' : 'pendiente', 1]
    })
    await pool.query(
      'INSERT INTO reportes (tipo, modo, ia_confianza, ia_corregido, descripcion, referencia, lat, lng, fecha_hecho, estado, es_demo) VALUES ?',
      [filas],
    )
    console.log(`✔ ${CANTIDAD} reportes DEMO creados (marcados con es_demo = 1)`)
  }
} finally {
  await pool.end()
}
