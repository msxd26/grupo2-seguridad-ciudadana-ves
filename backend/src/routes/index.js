import { Router } from 'express'
import { estadisticasRoutes } from './estadisticasRoutes.js'

export const routes = Router()

routes.get('/health', (_req, res) => res.json({ ok: true }))
routes.use('/estadisticas', estadisticasRoutes)
