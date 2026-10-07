import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { resetStore } from '../src/store/memory.js'

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  expect(res.status).toBe(200)
  return res.body.token as string
}

describe('stats', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns KPI counts from seed store', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.stats).toEqual({
      byStatus: {
        pending: 1,
        sent: 1,
        in_progress: 1,
        completed: 1,
        rejected: 0,
      },
      pending: 1,
      awaitingApproval: 1,
      inFlight: 2,
      approved: 0,
      totalInQueue: 4,
    })
  })

  it('updates after approve', async () => {
    const token = await loginAs('manager')
    await request(createApp())
      .post('/api/tickets/ticket-3/approve')
      .set('Authorization', `Bearer ${token}`)

    const res = await request(createApp())
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.stats.awaitingApproval).toBe(0)
    expect(res.body.stats.approved).toBe(1)
    expect(res.body.stats.totalInQueue).toBe(3)
  })
})
