import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { clearAllPartnerSimulations } from '../src/services/partnerSimulation.js'
import { resetStore } from '../src/store/memory.js'

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  expect(res.status).toBe(200)
  return res.body.token as string
}

describe('tickets', () => {
  beforeEach(() => {
    clearAllPartnerSimulations()
    resetStore()
  })

  it('lists seeded tickets when authenticated', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .get('/api/tickets')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.tickets).toHaveLength(4)
    expect(res.body.tickets[0]).toMatchObject({
      id: expect.any(String),
      status: expect.any(String),
      imagePaths: expect.any(Array),
    })
  })

  it('filters by status', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .get('/api/tickets')
      .query({ status: 'completed' })
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.tickets).toHaveLength(1)
    expect(res.body.tickets[0].id).toBe('ticket-3')
  })

  it('returns 401 without token', async () => {
    const res = await request(createApp()).get('/api/tickets')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('gets a ticket by id', async () => {
    const token = await loginAs('manager')
    const res = await request(createApp())
      .get('/api/tickets/ticket-1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.ticket.photoId).toBe('15377489')
  })

  it('returns 404 for unknown ticket', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .get('/api/tickets/missing')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('creates a ticket with allowlisted images', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoId: '15377489',
        style: 'Granita solid',
        priority: 'high',
        partnerId: 'partner-colorlab',
        pantoneNotes: 'Keep clipping path.',
        imagePaths: ['Ticket 1/15377489_5081878_001.jpg'],
      })

    expect(res.status).toBe(201)
    expect(res.body.ticket).toMatchObject({
      status: 'pending',
      photoId: '15377489',
      createdBy: 'user-operator',
    })
  })

  it('rejects create with image path outside allowlist', async () => {
    const token = await loginAs('manager')
    const res = await request(createApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoId: 'hack',
        style: 'Nope',
        priority: 'low',
        partnerId: 'partner-colorlab',
        pantoneNotes: 'notes',
        imagePaths: ['Ticket 1/../../../etc/passwd'],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects create with unknown partner', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoId: '15377489',
        style: 'Granita solid',
        priority: 'low',
        partnerId: 'partner-nope',
        pantoneNotes: 'notes',
        imagePaths: ['Ticket 1/15377489_5081878_001.jpg'],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('lists partners and seed images', async () => {
    const token = await loginAs('operator')
    const partners = await request(createApp())
      .get('/api/partners')
      .set('Authorization', `Bearer ${token}`)
    const images = await request(createApp())
      .get('/api/images')
      .set('Authorization', `Bearer ${token}`)

    expect(partners.status).toBe(200)
    expect(partners.body.partners).toHaveLength(3)
    expect(images.status).toBe(200)
    expect(images.body.images.length).toBeGreaterThan(0)
  })

  it('serves a seed asset', async () => {
    const res = await request(createApp()).get(
      '/assets/Ticket%201/15377489_5081878_001.jpg',
    )

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/image\/jpeg/)
  })

  it('send moves pending → sent, then partner-progress reaches completed', async () => {
    const token = await loginAs('operator')
    const sent = await request(createApp())
      .post('/api/tickets/ticket-1/send')
      .set('Authorization', `Bearer ${token}`)

    expect(sent.status).toBe(200)
    expect(sent.body.ticket).toMatchObject({
      id: 'ticket-1',
      status: 'sent',
      partnerReceiptId: expect.any(String),
    })

    const mid = await request(createApp())
      .post('/api/tickets/ticket-1/partner-progress')
      .set('Authorization', `Bearer ${token}`)
    expect(mid.status).toBe(200)
    expect(mid.body.ticket.status).toBe('in_progress')

    const done = await request(createApp())
      .post('/api/tickets/ticket-1/partner-progress')
      .set('Authorization', `Bearer ${token}`)
    expect(done.status).toBe(200)
    expect(done.body.ticket.status).toBe('completed')
  })

  it('returns 409 when partner-progress is called out of order', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets/ticket-1/partner-progress')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('returns 409 when sending a non-pending ticket', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets/ticket-3/send')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('allows manager to approve a completed ticket', async () => {
    const token = await loginAs('manager')
    const res = await request(createApp())
      .post('/api/tickets/ticket-3/approve')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.approved).toMatchObject({
      ticketId: 'ticket-3',
      photoId: '15377488',
      approvedBy: 'user-manager',
    })

    const missing = await request(createApp())
      .get('/api/tickets/ticket-3')
      .set('Authorization', `Bearer ${token}`)
    expect(missing.status).toBe(404)

    const approved = await request(createApp())
      .get('/api/approved')
      .set('Authorization', `Bearer ${token}`)
    expect(approved.status).toBe(200)
    expect(approved.body.approved).toHaveLength(1)
  })

  it('returns 403 when operator tries to approve', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets/ticket-3/approve')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('rejects completed ticket back to pending', async () => {
    const token = await loginAs('manager')
    const res = await request(createApp())
      .post('/api/tickets/ticket-3/reject')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.ticket).toMatchObject({
      id: 'ticket-3',
      status: 'pending',
    })
    expect(res.body.ticket.partnerReceiptId).toBeUndefined()
  })

  it('returns 403 when operator tries to reject', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/tickets/ticket-3/reject')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })
})
