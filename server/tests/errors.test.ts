import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js'
import { validateBody, validateQuery } from '../src/middleware/validate.js'
import { AppError } from '../src/types/errors.js'
import { createApp } from '../src/app.js'

function appWithRoutes() {
  const app = express()
  app.use(express.json())

  app.post(
    '/demo',
    validateBody(
      z.object({
        name: z.string().min(1),
      }),
    ),
    (req, res) => {
      res.json({ name: req.body.name })
    },
  )

  app.get(
    '/search',
    validateQuery(
      z.object({
        q: z.string().min(1),
      }),
    ),
    (req, res) => {
      res.json({ q: req.query.q })
    },
  )

  app.get('/boom', (_req, _res, next) => {
    next(AppError.conflict('Illegal transition'))
  })

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  return res.body.token as string
}

describe('error contract', () => {
  it('returns 401 for unknown protected routes without auth', async () => {
    const res = await request(createApp()).get('/api/missing')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 404 for unknown routes when authenticated', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .get('/api/missing')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    })
  })

  it('returns VALIDATION_ERROR details for bad body', async () => {
    const res = await request(appWithRoutes()).post('/demo').send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.details.fieldErrors.name).toBeDefined()
  })

  it('returns VALIDATION_ERROR for bad query', async () => {
    const res = await request(appWithRoutes()).get('/search')

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns CONFLICT from AppError', async () => {
    const res = await request(appWithRoutes()).get('/boom')

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Illegal transition',
      },
    })
  })
})
