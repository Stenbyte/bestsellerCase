import cors from 'cors'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { registerRoutes } from './routes/index.js'
import { SEED_ROOT } from './store/paths.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:5174'],
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  registerRoutes(app)

  app.use('/assets', express.static(SEED_ROOT, { fallthrough: false, index: false }))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
