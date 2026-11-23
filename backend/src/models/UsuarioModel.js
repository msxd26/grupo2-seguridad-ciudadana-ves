import { pool } from '../config/db.js'

// Datos públicos de un usuario (nunca se expone el hash de la contraseña).
const publico = (r) => ({
  id: r.id,
  nombre: r.nombre,
  email: r.email,
  rol: r.rol,
  activo: Boolean(r.activo),
  creadoEn: r.creado_en,
  ultimoAcceso: r.ultimo_acceso,
})

export const UsuarioModel = {
  async buscarPorEmailConHash(email) {
    const [[row]] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email])
    return row ? { ...publico(row), passwordHash: row.password_hash } : null
  },

  async buscarPorId(id) {
    const [[row]] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id])
    return row ? publico(row) : null
  },

  async crear({ nombre, email, passwordHash, rol = 'ciudadano' }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, rol],
    )
    return this.buscarPorId(result.insertId)
  },

  async registrarAcceso(id) {
    await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [id])
  },

  // Listado para administradores, con número de reportes por usuario.
  async listar({ q }) {
    const filtro = q ? 'WHERE u.nombre LIKE ? OR u.email LIKE ?' : ''
    const params = q ? [`%${q}%`, `%${q}%`] : []
    const [rows] = await pool.query(
      `SELECT u.*, COUNT(r.id) AS reportes
         FROM usuarios u LEFT JOIN reportes r ON r.usuario_id = u.id
         ${filtro}
        GROUP BY u.id
        ORDER BY u.creado_en DESC
        LIMIT 500`,
      params,
    )
    return rows.map((r) => ({ ...publico(r), reportes: Number(r.reportes) }))
  },

  async actualizar(id, { rol, activo }) {
    const campos = []
    const params = []
    if (rol !== undefined) { campos.push('rol = ?'); params.push(rol) }
    if (activo !== undefined) { campos.push('activo = ?'); params.push(activo ? 1 : 0) }
    if (!campos.length) return this.buscarPorId(id)
    await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, [...params, id])
    return this.buscarPorId(id)
  },

  async contarAdminsActivos() {
    const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'admin' AND activo = 1")
    return Number(row.n)
  },
}
