// Crea (o promueve) el administrador definido en .env: ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD.
// Uso: npm run db:admin
import { pool } from '../../src/config/db.js'
import { env } from '../../src/config/env.js'
import { validarPassword } from '../../src/services/authService.js'
import { hashPassword } from '../../src/utils/password.js'

const { nombre, email, password } = env.admin

try {
  if (!email || !password) throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env')
  const error = validarPassword(password)
  if (error) throw new Error(`ADMIN_PASSWORD no es válida: ${error}`)

  const correo = email.trim().toLowerCase()
  const [[existe]] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [correo])
  if (existe) {
    await pool.query("UPDATE usuarios SET rol = 'admin', activo = 1 WHERE id = ?", [existe.id])
    console.log(`✔ ${correo} ya existía: ahora es administrador (la contraseña no se modificó)`)
  } else {
    await pool.query("INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'admin')", [
      nombre, correo, await hashPassword(password),
    ])
    console.log(`✔ Administrador creado: ${correo}`)
  }
} finally {
  await pool.end()
}
