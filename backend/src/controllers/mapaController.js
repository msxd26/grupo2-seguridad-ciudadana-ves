import { listarComisarias, obtenerMapa } from '../services/mapaService.js'
import { obtenerAlertas } from '../services/alertasService.js'
import { LIMITE_VES } from '../utils/geo.js'
import { apiView } from '../views/apiView.js'

export const mapaController = {
  async mapa(req, res) {
    res.json(apiView.ok(await obtenerMapa(req.query)))
  },

  limite(_req, res) {
    res.set('Cache-Control', 'public, max-age=86400')
    res.json(apiView.ok({ limite: LIMITE_VES.geojson, bbox: LIMITE_VES.bbox }))
  },

  async comisarias(_req, res) {
    res.json(apiView.ok(await listarComisarias()))
  },

  async alertas(_req, res) {
    res.json(apiView.ok(await obtenerAlertas()))
  },
}
