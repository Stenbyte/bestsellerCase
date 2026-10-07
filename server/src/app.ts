import cors from 'cors'
import express from 'express'

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

  return app
}
