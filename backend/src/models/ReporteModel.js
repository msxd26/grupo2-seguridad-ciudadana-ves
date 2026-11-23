import { pool } from '../config/db.js'
import { MARCAS_PARA_OCULTAR } from '../config/fuente.js'

const mapear = (r) => ({
  id: r.id,
  tipo: r.tipo,
  modo: r.modo,
  iaConfianza: r.ia_confianza ?? null,
  iaCorregido: Boolean(r.ia_corregido),
  descripcion: r.descripcion,
  referencia: r.referencia,
  lat: Number(r.lat),
  lng: Number(r.lng),
  fechaHecho: r.fecha_hecho,
  estado: r.estado,
  esDemo: Boolean(r.es_demo),
  creadoEn: r.creado_en,
  marcas: Number(r.marcas ?? 0),
  confirmaciones: Number(r.confirmaciones ?? 0),
  oculto: Boolean(r.oculto),
  comentarioAdmin: r.comentario_admin ?? null,
  revisadoEn: r.revisado_en ?? null,
})

// Versión para administradores: incluye autor y revisor.
const mapearAdmin = (r) => ({
  ...mapear(r),
  autor: r.autor_nombre ? { id: r.usuario_id, nombre: r.autor_nombre, email: r.autor_email } : null,
  revisor: r.revisor_nombre ?? null,
})

// Reportes visibles para el público: ni descartados ni ocultos por la comunidad.
const VISIBLE = "estado <> 'descartado' AND oculto = 0"

const JOIN_ADMIN = `FROM reportes r
  LEFT JOIN usuarios u ON u.id = r.usuario_id
  LEFT JOIN usuarios rv ON rv.id = r.revisado_por`

export const ReporteModel = {
  // Alimentan el mapa, las alertas y el panel ciudadano.
  async listarRecientes({ dias, tipos = [] }) {
    const filtroTipo = tipos.length ? ' AND tipo IN (?)' : ''
    const [rows] = await pool.query(
      `SELECT * FROM reportes
        WHERE ${VISIBLE} AND fecha_hecho >= NOW() - INTERVAL ? DAY${filtroTipo}
        ORDER BY fecha_hecho DESC
        LIMIT 2000`,
      tipos.length ? [dias, tipos] : [dias],
    )
    return rows.map(mapear)
  },

  // Sincronización entre backends: último id y reportes/moderaciones guardados desde entonces.
  async ultimoId() {
    const [[row]] = await pool.query('SELECT COALESCE(MAX(id), 0) AS id FROM reportes')
    return Number(row.id)
  },

  async listarDesdeId(id, limite = 100) {
    const [rows] = await pool.query(`SELECT * FROM reportes WHERE id > ? AND ${VISIBLE} ORDER BY id LIMIT ?`, [id, limite])
    return rows.map(mapear)
  },

  async moderadosDesde(fecha) {
    const [rows] = await pool.query(
      'SELECT id, estado, oculto, revisado_en FROM reportes WHERE revisado_en IS NOT NULL AND revisado_en >= ? ORDER BY revisado_en LIMIT 100',
      [fecha],
    )
    return rows.map((r) => ({ id: r.id, estado: r.estado, oculto: Boolean(r.oculto), revisadoEn: r.revisado_en }))
  },

  // Para la predicción: solo lo necesario para agregar por zona (sin descripción ni autor, ODS 5).
  async listarParaPrediccion({ dias }) {
    const [rows] = await pool.query(
      `SELECT tipo, lat, lng, fecha_hecho, es_demo FROM reportes
        WHERE ${VISIBLE} AND fecha_hecho >= NOW() - INTERVAL ? DAY AND fecha_hecho <= NOW()`,
      [dias],
    )
    return rows.map((r) => ({ tipo: r.tipo, lat: Number(r.lat), lng: Number(r.lng), fecha: new Date(r.fecha_hecho), esDemo: Boolean(r.es_demo) }))
  },

  // Reportes visibles entre hace `desde` y hace `hasta` días (para comparar periodos).
  async contarVisiblesEntre(desdeDias, hastaDias) {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS n FROM reportes
        WHERE ${VISIBLE} AND fecha_hecho >= NOW() - INTERVAL ? DAY AND fecha_hecho < NOW() - INTERVAL ? DAY`,
      [desdeDias, hastaDias],
    )
    return Number(row.n)
  },

  async buscarPorId(id) {
    const [[row]] = await pool.query('SELECT * FROM reportes WHERE id = ?', [id])
    return row ? mapear(row) : null
  },

  async crear({ tipo, modo, iaConfianza = null, iaCorregido = false, descripcion, referencia, lat, lng, fechaHecho, usuarioId = null }) {
    const [result] = await pool.query(
      `INSERT INTO reportes (usuario_id, tipo, modo, ia_confianza, ia_corregido, descripcion, referencia, lat, lng, fecha_hecho)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, tipo, modo, iaConfianza, iaCorregido ? 1 : 0, descripcion, referencia, lat, lng, fechaHecho],
    )
    return this.buscarPorId(result.insertId)
  },

  // Registra una marca "esto es falso". Devuelve null si esa persona ya lo había marcado.
  async marcar(reporteId, huella) {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const [ins] = await conn.query('INSERT IGNORE INTO reporte_marcas (reporte_id, huella) VALUES (?, ?)', [reporteId, huella])
      if (!ins.affectedRows) {
        await conn.rollback()
        return null
      }
      // Al llegar al umbral se oculta, salvo que un administrador ya lo haya verificado.
      await conn.query(
        `UPDATE reportes SET marcas = marcas + 1,
                oculto = IF(marcas >= ? AND estado <> 'verificado', 1, oculto)
          WHERE id = ?`,
        [MARCAS_PARA_OCULTAR, reporteId],
      )
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
    return this.buscarPorId(reporteId)
  },

  // "Yo también lo vi". Devuelve null si esa persona ya lo había confirmado.
  async confirmar(reporteId, huella) {
    const [ins] = await pool.query('INSERT IGNORE INTO reporte_confirmaciones (reporte_id, huella) VALUES (?, ?)', [reporteId, huella])
    if (!ins.affectedRows) return null
    await pool.query('UPDATE reportes SET confirmaciones = confirmaciones + 1 WHERE id = ?', [reporteId])
    return this.buscarPorId(reporteId)
  },

  // Reporte de demostración (simulación en vivo): siempre con es_demo = 1.
  async crearDemo({ tipo, modo, iaConfianza = null, iaCorregido = false, descripcion, referencia, lat, lng, fechaHecho }) {
    const [result] = await pool.query(
      `INSERT INTO reportes (tipo, modo, ia_confianza, ia_corregido, descripcion, referencia, lat, lng, fecha_hecho, es_demo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [tipo, modo, iaConfianza, iaCorregido ? 1 : 0, descripcion, referencia, lat, lng, fechaHecho],
    )
    return this.buscarPorId(result.insertId)
  },

  async listarPorUsuario(usuarioId) {
    const [rows] = await pool.query('SELECT * FROM reportes WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 200', [usuarioId])
    return rows.map(mapear)
  },

  // Bandeja de moderación con filtros y paginación.
  async listarAdmin({ estado, tipo, q, incluirDemo, soloMarcados, pagina, porPagina }) {
    const where = []
    const params = []
    if (estado) { where.push('r.estado = ?'); params.push(estado) }
    if (tipo) { where.push('r.tipo = ?'); params.push(tipo) }
    if (soloMarcados) where.push('r.marcas > 0')
    if (!incluirDemo) where.push('r.es_demo = 0')
    if (q) {
      where.push('(r.descripcion LIKE ? OR r.referencia LIKE ? OR u.nombre LIKE ? OR r.id = ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, Number(q) || 0)
    }
    const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [[[{ total }]], [rows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total ${JOIN_ADMIN} ${sqlWhere}`, params),
      pool.query(
        `SELECT r.*, u.nombre AS autor_nombre, u.email AS autor_email, rv.nombre AS revisor_nombre
           ${JOIN_ADMIN} ${sqlWhere}
          ORDER BY r.oculto DESC, FIELD(r.estado, 'pendiente', 'verificado', 'descartado'), r.marcas DESC, r.creado_en DESC
          LIMIT ? OFFSET ?`,
        [...params, porPagina, (pagina - 1) * porPagina],
      ),
    ])
    return { total: Number(total), reportes: rows.map(mapearAdmin) }
  },

  // La decisión del administrador prevalece sobre las marcas: verificar o devolver a pendiente lo vuelve visible.
  async actualizarEstado(id, { estado, comentario, revisorId }) {
    const [result] = await pool.query(
      `UPDATE reportes SET estado = ?, comentario_admin = ?, revisado_por = ?, revisado_en = NOW(),
              oculto = IF(? = 'descartado', oculto, 0)
        WHERE id = ?`,
      [estado, comentario, revisorId, estado, id],
    )
    if (!result.affectedRows) return null
    const [[row]] = await pool.query(
      `SELECT r.*, u.nombre AS autor_nombre, u.email AS autor_email, rv.nombre AS revisor_nombre ${JOIN_ADMIN} WHERE r.id = ?`,
      [id],
    )
    return mapearAdmin(row)
  },

  async resumenAdmin({ incluirDemo }) {
    const demo = incluirDemo ? '' : 'AND es_demo = 0'
    const [[porEstado], [porTipo], [porDia], [[ocultos]]] = await Promise.all([
      pool.query(`SELECT estado, COUNT(*) AS n FROM reportes WHERE 1 = 1 ${demo} GROUP BY estado`),
      pool.query(
        `SELECT tipo, COUNT(*) AS n FROM reportes
          WHERE ${VISIBLE} AND creado_en >= NOW() - INTERVAL 30 DAY ${demo}
          GROUP BY tipo ORDER BY n DESC`,
      ),
      pool.query(
        `SELECT DATE(creado_en) AS dia, COUNT(*) AS n FROM reportes
          WHERE creado_en >= CURDATE() - INTERVAL 13 DAY ${demo}
          GROUP BY DATE(creado_en) ORDER BY dia`,
      ),
      pool.query(`SELECT COUNT(*) AS n FROM reportes WHERE oculto = 1 ${demo}`),
    ])
    return {
      porEstado: Object.fromEntries(porEstado.map((r) => [r.estado, Number(r.n)])),
      porTipo: porTipo.map((r) => ({ tipo: r.tipo, total: Number(r.n) })),
      porDia: porDia.map((r) => ({ dia: r.dia, total: Number(r.n) })),
      ocultos: Number(ocultos.n),
    }
  },
}
