import { pool } from '../config/db.js'

// Fragmento SQL opcional para filtrar por modalidades.
function filtroModalidad(modalidades) {
  return modalidades.length ? { sql: ' AND modalidad IN (?)', params: [modalidades] } : { sql: '', params: [] }
}

// Modelo: consultas a denuncias_policiales (Lima Metropolitana, SIDPOL).
export const DenunciaModel = {
  // Años disponibles y último mes publicado de cada uno.
  async periodos() {
    const [rows] = await pool.query(
      'SELECT anio, MAX(mes) AS ultimo_mes FROM denuncias_policiales GROUP BY anio ORDER BY anio',
    )
    return rows
  },

  async modalidades() {
    const [rows] = await pool.query(
      'SELECT modalidad, SUM(cantidad) AS total FROM denuncias_policiales GROUP BY modalidad ORDER BY total DESC',
    )
    return rows.map((r) => r.modalidad)
  },

  async distritos() {
    const [rows] = await pool.query(
      'SELECT ubigeo, distrito FROM denuncias_policiales GROUP BY ubigeo, distrito ORDER BY distrito',
    )
    return rows
  },

  // Detalle de un distrito por año, mes y modalidad.
  async detalleDistrito({ ubigeo, desde, hasta, modalidades }) {
    const f = filtroModalidad(modalidades)
    const [rows] = await pool.query(
      `SELECT anio, mes, modalidad, SUM(cantidad) AS total
         FROM denuncias_policiales
        WHERE ubigeo = ? AND anio BETWEEN ? AND ?${f.sql}
        GROUP BY anio, mes, modalidad`,
      [ubigeo, desde, hasta, ...f.params],
    )
    return rows.map((r) => ({ anio: r.anio, mes: r.mes, modalidad: r.modalidad, total: Number(r.total) }))
  },

  // Totales por distrito en un periodo (el último año se corta en `ultimoMes`).
  async rankingDistritos({ desde, hasta, ultimoMes, modalidades }) {
    const f = filtroModalidad(modalidades)
    const [rows] = await pool.query(
      `SELECT ubigeo, distrito, SUM(cantidad) AS total
         FROM denuncias_policiales
        WHERE anio BETWEEN ? AND ? AND (anio < ? OR mes <= ?)${f.sql}
        GROUP BY ubigeo, distrito
        ORDER BY total DESC`,
      [desde, hasta, hasta, ultimoMes, ...f.params],
    )
    return rows.map((r) => ({ ubigeo: r.ubigeo, distrito: r.distrito, total: Number(r.total) }))
  },
}
