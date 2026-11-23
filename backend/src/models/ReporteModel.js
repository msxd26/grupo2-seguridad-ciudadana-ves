import { pool } from '../config/db.js'

const mapear = (r) => ({
  id: r.id,
  tipo: r.tipo,
  descripcion: r.descripcion,
  referencia: r.referencia,
  lat: Number(r.lat),
  lng: Number(r.lng),
  fechaHecho: r.fecha_hecho,
  estado: r.estado,
  esDemo: Boolean(r.es_demo),
  creadoEn: r.creado_en,
  comentarioAdmin: r.comentario_admin ?? null,
  revisadoEn: r.revisado_en ?? null,
})

// Versión para administradores: incluye autor y revisor.
const mapearAdmin = (r) => ({
  ...mapear(r),
  autor: r.autor_nombre ? { id: r.usuario_id, nombre: r.autor_nombre, email: r.autor_email } : null,
  revisor: r.revisor_nombre ?? null,
})

export const ReporteModel = {
  // Reportes públicos (no descartados) de los últimos `dias` días: alimentan mapa y alertas.
  async listarRecientes({ dias, tipos = [] }) {
    const filtroTipo = tipos.length ? ' AND tipo IN (?)' : ''
    const [rows] = await pool.query(
      `SELECT * FROM reportes
        WHERE estado <> 'descartado' AND fecha_hecho >= NOW() - INTERVAL ? DAY${filtroTipo}
        ORDER BY fecha_hecho DESC
        LIMIT 1000`,
      tipos.length ? [dias, tipos] : [dias],
    )
    return rows.map(mapear)
  },

  async crear({ tipo, descripcion, referencia, lat, lng, fechaHecho, usuarioId = null }) {
    const [result] = await pool.query(
      `INSERT INTO reportes (usuario_id, tipo, descripcion, referencia, lat, lng, fecha_hecho) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, tipo, descripcion, referencia, lat, lng, fechaHecho],
    )
    const [[row]] = await pool.query('SELECT * FROM reportes WHERE id = ?', [result.insertId])
    return mapear(row)
  },

  async listarPorUsuario(usuarioId) {
    const [rows] = await pool.query(
      'SELECT * FROM reportes WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 200',
      [usuarioId],
    )
    return rows.map(mapear)
  },

  // Bandeja de moderación con filtros y paginación.
  async listarAdmin({ estado, tipo, q, incluirDemo, pagina, porPagina }) {
    const where = []
    const params = []
    if (estado) { where.push('r.estado = ?'); params.push(estado) }
    if (tipo) { where.push('r.tipo = ?'); params.push(tipo) }
    if (!incluirDemo) where.push('r.es_demo = 0')
    if (q) {
      where.push('(r.descripcion LIKE ? OR r.referencia LIKE ? OR u.nombre LIKE ? OR r.id = ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, Number(q) || 0)
    }
    const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const desde = `FROM reportes r LEFT JOIN usuarios u ON u.id = r.usuario_id LEFT JOIN usuarios rv ON rv.id = r.revisado_por ${sqlWhere}`

    const [[[{ total }]], [rows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total ${desde}`, params),
      pool.query(
        `SELECT r.*, u.nombre AS autor_nombre, u.email AS autor_email, rv.nombre AS revisor_nombre ${desde}
          ORDER BY FIELD(r.estado, 'pendiente', 'verificado', 'descartado'), r.creado_en DESC
          LIMIT ? OFFSET ?`,
        [...params, porPagina, (pagina - 1) * porPagina],
      ),
    ])
    return { total: Number(total), reportes: rows.map(mapearAdmin) }
  },

  async actualizarEstado(id, { estado, comentario, revisorId }) {
    const [result] = await pool.query(
      'UPDATE reportes SET estado = ?, comentario_admin = ?, revisado_por = ?, revisado_en = NOW() WHERE id = ?',
      [estado, comentario, revisorId, id],
    )
    if (!result.affectedRows) return null
    const [[row]] = await pool.query(
      `SELECT r.*, u.nombre AS autor_nombre, u.email AS autor_email, rv.nombre AS revisor_nombre
         FROM reportes r LEFT JOIN usuarios u ON u.id = r.usuario_id LEFT JOIN usuarios rv ON rv.id = r.revisado_por
        WHERE r.id = ?`,
      [id],
    )
    return mapearAdmin(row)
  },

  // Indicadores para el resumen del administrador.
  async resumenAdmin({ incluirDemo }) {
    const demo = incluirDemo ? '' : 'AND es_demo = 0'
    const [[porEstado], [porTipo], [porDia]] = await Promise.all([
      pool.query(`SELECT estado, COUNT(*) AS n FROM reportes WHERE 1 = 1 ${demo} GROUP BY estado`),
      pool.query(
        `SELECT tipo, COUNT(*) AS n FROM reportes
          WHERE estado <> 'descartado' AND creado_en >= NOW() - INTERVAL 30 DAY ${demo}
          GROUP BY tipo ORDER BY n DESC`,
      ),
      pool.query(
        `SELECT DATE(creado_en) AS dia, COUNT(*) AS n FROM reportes
          WHERE creado_en >= CURDATE() - INTERVAL 13 DAY ${demo}
          GROUP BY DATE(creado_en) ORDER BY dia`,
      ),
    ])
    return {
      porEstado: Object.fromEntries(porEstado.map((r) => [r.estado, Number(r.n)])),
      porTipo: porTipo.map((r) => ({ tipo: r.tipo, total: Number(r.n) })),
      porDia: porDia.map((r) => ({ dia: r.dia, total: Number(r.n) })),
    }
  },
}
