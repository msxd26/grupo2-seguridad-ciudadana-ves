// Carga en MySQL las denuncias de Villa El Salvador desde el CSV oficial (MININTER).
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pool } from '../../src/config/db.js'
import { parseDenunciasCsv } from './csv.js'

const CSV_PATH = join(import.meta.dirname, 'data', 'denuncias_ves_mininter.csv')

const rows = parseDenunciasCsv(await readFile(CSV_PATH, 'utf8')).map((r) => [
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
  await pool.query(
    `INSERT INTO denuncias_policiales
       (anio, mes, departamento, provincia, distrito, ubigeo, modalidad, cantidad)
     VALUES ?
     ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
    [rows],
  )
  console.log(`✔ ${rows.length} registros cargados en denuncias_policiales`)
} finally {
  await pool.end()
}
