import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { routes } from './routes/index.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

export const app = express()

app.set('trust proxy', 'loopback') // IP real detrás del proxy de Vite (para el límite de reportes)
app.use(cors({ origin: env.corsOrigin, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '20kb' }))
app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)
