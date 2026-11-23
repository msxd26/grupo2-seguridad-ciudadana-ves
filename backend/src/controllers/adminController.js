import * as admin from '../services/adminService.js'
import { apiView } from '../views/apiView.js'

export const adminController = {
  async resumen(req, res) {
    res.json(apiView.ok(await admin.resumen(req.query)))
  },

  async reportes(req, res) {
    res.json(apiView.ok(await admin.listarReportes(req.query)))
  },

  async moderar(req, res) {
    res.json(apiView.ok(await admin.moderarReporte(req.params.id, req.body ?? {}, req.usuario)))
  },

  async usuarios(req, res) {
    res.json(apiView.ok(await admin.listarUsuarios(req.query)))
  },

  async actualizarUsuario(req, res) {
    res.json(apiView.ok(await admin.actualizarUsuario(req.params.id, req.body ?? {}, req.usuario)))
  },
}
