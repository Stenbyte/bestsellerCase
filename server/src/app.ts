import cors from 'cors'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

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

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
