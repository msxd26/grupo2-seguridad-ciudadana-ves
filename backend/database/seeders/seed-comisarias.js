// Carga las comisarías de Villa El Salvador y distritos vecinos (MININTER, con GPS).
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pool } from '../../src/config/db.js'
import { parseCsv } from './csv.js'

const CSV_PATH = join(import.meta.dirname, 'data', 'comisarias_mininter.csv')

const rows = parseCsv(await readFile(CSV_PATH, 'utf8')).map((r) => [
  r.codigo_cpnp,
  r.nombre,
  r.distrito,
  r.tipo || null,
  r.divpol || null,
  Number(r.lat),
  Number(r.lng),
])

try {
  await pool.query(
    `INSERT INTO comisarias (codigo_cpnp, nombre, distrito, tipo, divpol, lat, lng)
     VALUES ?
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), distrito = VALUES(distrito),
       tipo = VALUES(tipo), divpol = VALUES(divpol), lat = VALUES(lat), lng = VALUES(lng)`,
    [rows],
  )
  console.log(`✔ ${rows.length} comisarías cargadas`)
} finally {
  await pool.end()
}
