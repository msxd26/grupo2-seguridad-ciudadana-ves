import { Router } from 'express'
import { dashboardController } from '../controllers/dashboardController.js'
import { reportesController } from '../controllers/reportesController.js'
import { mapaController } from '../controllers/mapaController.js'
import { authController } from '../controllers/authController.js'
import { adminController } from '../controllers/adminController.js'
import { prediccionesController } from '../controllers/prediccionesController.js'
import { rateLimit } from '../middlewares/rateLimit.js'
import { autenticar, requerirRol, requerirSesion } from '../middlewares/auth.js'

export const routes = Router()

routes.get('/health', (_req, res) => res.json({ ok: true }))

// Sesión (en todas las rutas: deja req.usuario si hay cookie válida)
routes.use(autenticar)

// Autenticación
const limiteAuth = rateLimit({ max: 10, ventanaMs: 10 * 60_000, mensaje: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' })
routes.post('/auth/registro', limiteAuth, authController.registro)
routes.post('/auth/login', limiteAuth, authController.login)
routes.post('/auth/logout', authController.logout)
routes.get('/auth/me', authController.me)

// Panel de decisión (datos oficiales SIDPOL)
routes.get('/catalogos', dashboardController.catalogos)
routes.get('/dashboard', dashboardController.dashboard)

// Predicción de reportes por zona y plan de acción (datos agregados, sin reportes individuales)
const limitePlan = rateLimit({ max: 20, ventanaMs: 10 * 60_000, mensaje: 'Pediste muchos planes seguidos. Espera unos minutos.' })
routes.get('/predicciones', prediccionesController.predicciones)
routes.get('/predicciones/plan', limitePlan, prediccionesController.plan)

// Mapa, comisarías y alertas
routes.get('/mapa', mapaController.mapa)
routes.get('/mapa/limite', mapaController.limite)
routes.get('/mapa/brecha', mapaController.brecha)
routes.get('/comisarias', mapaController.comisarias)
routes.get('/alertas', mapaController.alertas)
const limiteRecomendacion = rateLimit({ max: 30, ventanaMs: 10 * 60_000, mensaje: 'Pediste muchas recomendaciones. Espera unos minutos.' })
routes.get('/recomendacion', limiteRecomendacion, mapaController.recomendacion)

// Reportes ciudadanos
const limiteReportes = rateLimit({ max: 5, ventanaMs: 10 * 60_000, mensaje: 'Demasiados reportes en poco tiempo. Intenta nuevamente en unos minutos.' })
const limiteChat = rateLimit({ max: 40, ventanaMs: 10 * 60_000, mensaje: 'El asistente recibió muchos mensajes. Espera unos minutos.' })
const limiteMarcas = rateLimit({ max: 20, ventanaMs: 10 * 60_000 })
routes.get('/reportes/tipos', reportesController.tipos)
routes.get('/reportes/mios', requerirSesion, reportesController.mios)
routes.get('/reportes', reportesController.listar)
routes.post('/reportes', limiteReportes, reportesController.crear)
routes.post('/reportes/chat', limiteChat, reportesController.chat)
routes.post('/reportes/:id/marcar', limiteMarcas, reportesController.marcar)
routes.post('/reportes/:id/confirmar', limiteMarcas, reportesController.confirmar)
routes.get('/presencia', reportesController.presencia)
routes.get('/panel-ciudadano', reportesController.panelCiudadano)

// Tiempo real: WebSocket en /api/ws (ver utils/tiempoReal.js)

// Administración (solo rol admin)
const admin = Router()
admin.use(requerirRol('admin'))
admin.get('/resumen', adminController.resumen)
admin.get('/reportes', adminController.reportes)
admin.patch('/reportes/:id', adminController.moderar)
admin.get('/simulacion', adminController.simulacion)
admin.post('/simulacion', adminController.cambiarSimulacion)
admin.post('/simulacion/rafaga', adminController.rafaga)
admin.get('/usuarios', adminController.usuarios)
admin.patch('/usuarios/:id', adminController.actualizarUsuario)
routes.use('/admin', admin)
