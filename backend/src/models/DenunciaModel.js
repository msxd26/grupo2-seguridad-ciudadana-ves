import { pool } from '../config/db.js'
import { FUENTE_DENUNCIAS } from '../config/fuente.js'

const UBIGEO = FUENTE_DENUNCIAS.ubigeo

// Modelo: consultas a la tabla denuncias_policiales (solo Villa El Salvador).
export const DenunciaModel = {
  async totalPorAnio() {
    const [rows] = await pool.query(
      `SELECT anio, SUM(cantidad) AS total, MAX(mes) AS ultimo_mes
         FROM denuncias_policiales WHERE ubigeo = ?
        GROUP BY anio ORDER BY anio`,
      [UBIGEO],
    )
    return rows
  },

  async totalPorModalidad(anio) {
    const [rows] = await pool.query(
      `SELECT modalidad, SUM(cantidad) AS total
         FROM denuncias_policiales WHERE ubigeo = ? AND anio = ?
        GROUP BY modalidad ORDER BY total DESC`,
      [UBIGEO, anio],
    )
    return rows
  },

  async totalPorMes(anio) {
    const [rows] = await pool.query(
      `SELECT mes, SUM(cantidad) AS total
         FROM denuncias_policiales WHERE ubigeo = ? AND anio = ?
        GROUP BY mes ORDER BY mes`,
      [UBIGEO, anio],
    )
    return rows
  },

  // Total de un año hasta un mes dado (para comparar periodos equivalentes).
  async totalHastaMes(anio, mes) {
    const [[row]] = await pool.query(
      `SELECT COALESCE(SUM(cantidad), 0) AS total
         FROM denuncias_policiales WHERE ubigeo = ? AND anio = ? AND mes <= ?`,
      [UBIGEO, anio, mes],
    )
    return Number(row.total)
  },
}
