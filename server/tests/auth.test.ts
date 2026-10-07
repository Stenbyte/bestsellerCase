import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { authenticate, authorize } from '../src/middleware/auth.js'
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js'

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  expect(res.status).toBe(200)
  return res.body.token as string
}

function managerOnlyApp() {
  const app = express()
  app.use(express.json())
  app.post(
    '/api/tickets/demo/approve',
    authenticate,
    authorize('manager'),
    (_req, res) => {
      res.json({ ok: true })
    },
  )
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

describe('auth', () => {
  it('logs in as operator and returns token + user', async () => {
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ role: 'operator' })

    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({
      role: 'operator',
      email: 'operator@recolour.demo',
    })
  })

  it('rejects invalid login body', async () => {
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ role: 'admin' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns current user from /api/me', async () => {
    const token = await loginAs('manager')
    const res = await request(createApp())
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe('manager')
  })

  it('returns 401 without token', async () => {
    const res = await request(createApp()).get('/api/me')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 for bad token', async () => {
    const res = await request(createApp())
      .get('/api/me')
      .set('Authorization', 'Bearer not-a-real-token')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 403 when operator hits manager-only route', async () => {
    const token = await loginAs('operator')
    const res = await request(managerOnlyApp())
      .post('/api/tickets/demo/approve')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('allows manager on manager-only route', async () => {
    const token = await loginAs('manager')
    const res = await request(managerOnlyApp())
      .post('/api/tickets/demo/approve')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
