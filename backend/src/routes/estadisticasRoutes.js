import { Router } from 'express'
import { estadisticasController as c } from '../controllers/estadisticasController.js'

export const estadisticasRoutes = Router()

estadisticasRoutes.get('/por-anio', c.porAnio)
estadisticasRoutes.get('/por-modalidad', c.porModalidad)
estadisticasRoutes.get('/por-mes', c.porMes)
estadisticasRoutes.get('/resumen', c.resumen)
