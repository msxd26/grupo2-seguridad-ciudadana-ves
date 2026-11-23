import * as service from '../services/estadisticasService.js'
import { estadisticasView } from '../views/estadisticasView.js'

function parseAnio(value) {
  const anio = Number(value)
  return Number.isInteger(anio) && anio >= 2000 && anio <= 2100 ? anio : null
}

const anioInvalido = (res) =>
  res.status(400).json(estadisticasView.error('Parámetro "anio" inválido'))

// Controlador: valida la petición y responde. Express 5 propaga los errores async.
export const estadisticasController = {
  async porAnio(_req, res) {
    res.json(estadisticasView.ok(await service.obtenerPorAnio()))
  },

  async porModalidad(req, res) {
    const anio = parseAnio(req.query.anio)
    if (!anio) return anioInvalido(res)
    res.json(estadisticasView.ok(await service.obtenerPorModalidad(anio), { anio }))
  },

  async porMes(req, res) {
    const anio = parseAnio(req.query.anio)
    if (!anio) return anioInvalido(res)
    res.json(estadisticasView.ok(await service.obtenerPorMes(anio), { anio }))
  },

  async resumen(req, res) {
    const anio = parseAnio(req.query.anio)
    if (!anio) return anioInvalido(res)
    const resumen = await service.obtenerResumen(anio)
    if (!resumen) return res.status(404).json(estadisticasView.error(`Sin datos para ${anio}`))
    res.json(estadisticasView.ok(resumen))
  },
}
