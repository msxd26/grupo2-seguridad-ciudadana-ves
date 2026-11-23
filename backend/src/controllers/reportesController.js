import { crearReporte, listarReportes, misReportes, tiposReporte } from '../services/reportesService.js'
import { apiView } from '../views/apiView.js'

export const reportesController = {
  async tipos(_req, res) {
    res.json(apiView.ok(tiposReporte()))
  },

  async listar(req, res) {
    res.json(apiView.ok(await listarReportes(req.query)))
  },

  // Si hay sesión, el reporte queda vinculado al usuario; si no, es anónimo.
  async crear(req, res) {
    const reporte = await crearReporte(req.body ?? {}, req.usuario)
    res.status(201).json(apiView.ok(reporte))
  },

  async mios(req, res) {
    res.json(apiView.ok(await misReportes(req.usuario)))
  },
}
