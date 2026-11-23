// Crea la base de datos (si no existe) y ejecuta las migraciones SQL en orden.
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

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    await connection.query(await readFile(join(MIGRATIONS_DIR, file), 'utf8'))
    console.log(`✔ Migración aplicada: ${file}`)
  }
} finally {
  await connection.end()
}
