// Arranque del contenedor: espera a MySQL, aplica migraciones, carga los datos oficiales
// (solo si faltan), crea el administrador y, al final, inicia la API.
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import mysql from 'mysql2/promise'
import { env } from '../src/config/env.js'

const RAIZ = join(import.meta.dirname, '..')
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

function ejecutar(script, args = []) {
  const r = spawnSync(process.execPath, [join(RAIZ, script), ...args], { stdio: 'inherit', cwd: RAIZ })
  if (r.status !== 0) throw new Error(`Falló ${script}`)
}

async function esperarMysql(intentos = 40) {
  const { database: _bd, ...servidor } = env.db
  for (let i = 1; i <= intentos; i++) {
    try {
      const conn = await mysql.createConnection(servidor)
      await conn.end()
      return
    } catch {
      console.log(`… esperando a MySQL (${i}/${intentos})`)
      await esperar(3000)
    }
  }
  throw new Error('MySQL no respondió a tiempo')
}

async function contar(tabla, where = '') {
  const conn = await mysql.createConnection(env.db)
  try {
    const [[fila]] = await conn.query(`SELECT COUNT(*) AS n FROM ${tabla} ${where}`)
    return Number(fila.n)
  } finally {
    await conn.end()
  }
}

await esperarMysql()
ejecutar('database/migrate.js')

if ((await contar('denuncias_policiales')) === 0) ejecutar('database/seeders/seed-denuncias.js')
else console.log('✔ Denuncias oficiales ya cargadas')

ejecutar('database/seeders/seed-comisarias.js')
if (env.admin.email && env.admin.password) ejecutar('database/seeders/crear-admin.js')

if (process.env.SEED_DEMO === 'true' && (await contar('reportes', 'WHERE es_demo = 1')) === 0) {
  ejecutar('database/seeders/seed-demo-reportes.js')
}

await import('../src/server.js')
