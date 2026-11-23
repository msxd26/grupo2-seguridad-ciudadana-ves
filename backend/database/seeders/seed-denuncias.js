// Carga en MySQL las denuncias de Lima Metropolitana desde el CSV oficial (MININTER - SIDPOL).
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pool } from '../../src/config/db.js'
import { parseCsv } from './csv.js'

const CSV_PATH = join(import.meta.dirname, 'data', 'denuncias_lima_mininter.csv')
const LOTE = 5000

const rows = parseCsv(await readFile(CSV_PATH, 'utf8')).map((r) => [
  Number(r.ANIO_REGISTRO),
  Number(r.MES_REGISTRO),
  r.DPTO_HECHO_NEW,
  r.PROV_HECHO,
  r.DIST_HECHO,
  r.UBIGEO_HECHO.padStart(6, '0'),
  r.P_MODALIDADES,
  Number(r.cantidad),
])

try {
  for (let i = 0; i < rows.length; i += LOTE) {
    await pool.query(
      `INSERT INTO denuncias_policiales
         (anio, mes, departamento, provincia, distrito, ubigeo, modalidad, cantidad)
       VALUES ?
       ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
      [rows.slice(i, i + LOTE)],
    )
  }
  console.log(`✔ ${rows.length} registros de denuncias cargados`)
} finally {
  await pool.end()
}
