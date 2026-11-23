// Crea la base de datos (si no existe) y ejecuta las migraciones SQL pendientes, en orden.
// Las migraciones aplicadas se registran en `schema_migrations` para no repetirlas.
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations')

const { database, ...server } = env.db
const connection = await mysql.createConnection({ ...server, multipleStatements: true })

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await connection.changeUser({ database })
  await connection.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       archivo VARCHAR(255) PRIMARY KEY,
       aplicado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`,
  )

  const [rows] = await connection.query('SELECT archivo FROM schema_migrations')
  const aplicadas = new Set(rows.map((r) => r.archivo))
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()

  let pendientes = 0
  for (const file of files) {
    if (aplicadas.has(file)) continue
    await connection.query(await readFile(join(MIGRATIONS_DIR, file), 'utf8'))
    await connection.query('INSERT INTO schema_migrations (archivo) VALUES (?)', [file])
    console.log(`✔ Migración aplicada: ${file}`)
    pendientes++
  }
  if (!pendientes) console.log('✔ La base de datos ya está al día')
} finally {
  await connection.end()
}
