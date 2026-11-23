import { confirmarReporte, crearReporte, listarReportes, marcarFalso, misReportes, tiposReporte } from '../services/reportesService.js'
import { conversar } from '../services/iaService.js'
import { obtenerPanelCiudadano } from '../services/ciudadanoService.js'
import { suscribirSse, totalConectados } from '../utils/eventos.js'
import { apiView } from '../views/apiView.js'

export const reportesController = {
  tipos(_req, res) {
    res.json(apiView.ok(tiposReporte()))
  },

  async listar(req, res) {
    res.json(apiView.ok(await listarReportes(req.query)))
  },

  // Si hay sesión, el reporte queda vinculado al usuario; si no, es anónimo.
  async crear(req, res) {
    res.status(201).json(apiView.ok(await crearReporte(req.body ?? {}, req.usuario)))
  },

  async mios(req, res) {
    res.json(apiView.ok(await misReportes(req.usuario)))
  },

  // Moderación comunitaria: "esto es falso".
  async marcar(req, res) {
    res.json(apiView.ok(await marcarFalso(req.params.id, req)))
  },

  // "Yo también lo vi".
  async confirmar(req, res) {
    res.json(apiView.ok(await confirmarReporte(req.params.id, req)))
  },

  presencia(_req, res) {
    res.json(apiView.ok({ conectados: totalConectados() }))
  },

  // Asistente conversacional (Groq o clasificador local).
  async chat(req, res) {
    res.json(apiView.ok(await conversar(req.body ?? {})))
  },

  async panelCiudadano(req, res) {
    res.json(apiView.ok(await obtenerPanelCiudadano(req.query)))
  },

  // Canal de eventos en tiempo real (Server-Sent Events).
  eventos(req, res) {
    suscribirSse(req, res)
  },
}
