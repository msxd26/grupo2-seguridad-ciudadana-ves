import { obtenerPredicciones } from '../services/prediccionService.js'
import { obtenerPlanAccion } from '../services/planAccionService.js'
import { apiView } from '../views/apiView.js'

// Predicción de reportes por zona y plan de acción recomendado (panel municipal).
export const prediccionesController = {
  async predicciones(_req, res) {
    res.json(apiView.ok(await obtenerPredicciones()))
  },

  async plan(req, res) {
    res.json(apiView.ok(await obtenerPlanAccion(req.query)))
  },
}
