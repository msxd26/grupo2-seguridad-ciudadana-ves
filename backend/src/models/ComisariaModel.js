import { pool } from '../config/db.js'
import { tituloDistrito } from '../utils/texto.js'

export const ComisariaModel = {
  async listar() {
    const [rows] = await pool.query(
      'SELECT codigo_cpnp, nombre, distrito, tipo, divpol, lat, lng FROM comisarias ORDER BY distrito, nombre',
    )
    return rows.map((r) => ({
      codigo: r.codigo_cpnp,
      nombre: r.nombre,
      distrito: tituloDistrito(r.distrito),
      tipo: r.tipo,
      divpol: r.divpol,
      lat: Number(r.lat),
      lng: Number(r.lng),
    }))
  },
}
