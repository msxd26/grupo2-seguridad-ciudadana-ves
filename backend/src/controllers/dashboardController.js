import { obtenerDashboard } from '../services/dashboardService.js'
import { obtenerCatalogos } from '../services/metaService.js'
import { apiView } from '../views/apiView.js'

// Express 5 propaga los errores async al manejador de errores.
export const dashboardController = {
  async catalogos(_req, res) {
    res.json(apiView.ok(await obtenerCatalogos()))
  },

  async dashboard(req, res) {
    res.json(apiView.ok(await obtenerDashboard(req.query)))
  },
}
