import cors from 'cors'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { authRouter, meRouter } from './routes/auth.js'

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

  app.use('/api/auth', authRouter)
  app.use('/api/me', meRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
