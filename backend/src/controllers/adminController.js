import * as admin from '../services/adminService.js'
import { detenerSimulacion, estadoSimulacion, generarRafaga, iniciarSimulacion } from '../services/simulacionService.js'
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

  simulacion(_req, res) {
    res.json(apiView.ok(estadoSimulacion()))
  },

  cambiarSimulacion(req, res) {
    const { activa, intervaloSeg } = req.body ?? {}
    res.json(apiView.ok(activa ? iniciarSimulacion({ intervaloSeg }) : detenerSimulacion()))
  },

  // "Generar alertas ahora": ráfaga de reportes DEMO para probar los avisos.
  rafaga(req, res) {
    res.status(202).json(apiView.ok(generarRafaga(req.body ?? {})))
  },

  async usuarios(req, res) {
    res.json(apiView.ok(await admin.listarUsuarios(req.query)))
  },

  async actualizarUsuario(req, res) {
    res.json(apiView.ok(await admin.actualizarUsuario(req.params.id, req.body ?? {}, req.usuario)))
  },
}
