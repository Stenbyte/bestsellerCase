import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { resetStore } from '../src/store/memory.js'
import { SEED_ROOT } from '../src/store/paths.js'

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  expect(res.status).toBe(200)
  return res.body.token as string
}

/** Minimal buffer that passes JPEG magic-byte check. */
const FAKE_BUT_MAGIC_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x00])

describe('uploads', () => {
  beforeEach(() => {
    resetStore()
  })

  it('rejects non-JPEG magic bytes', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('not-a-jpeg'), {
        filename: 'trick.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects SVG even with image MIME spoofing', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'x.svg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/SVG/i)
  })

  it('accepts a real seed JPEG and allowlists it for ticket create', async () => {
    const token = await loginAs('operator')
    const seedFile = path.join(SEED_ROOT, 'Ticket 1/15377489_5081878_001.jpg')
    const bytes = fs.readFileSync(seedFile)

    const upload = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', bytes, { filename: 'photo.jpg', contentType: 'image/jpeg' })

    expect(upload.status).toBe(201)
    expect(upload.body.image.path).toMatch(/^uploads\/.+\.jpg$/)

    const create = await request(createApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoId: 'upload-demo',
        style: 'Uploaded',
        priority: 'low',
        partnerId: 'partner-colorlab',
        pantoneNotes: 'notes',
        imagePaths: [upload.body.image.path],
      })

    expect(create.status).toBe(201)
    expect(create.body.ticket.imagePaths).toEqual([upload.body.image.path])

    const asset = await request(createApp()).get(
      `/assets/${upload.body.image.path}`,
    )
    expect(asset.status).toBe(200)
    expect(asset.headers['content-type']).toMatch(/image\/jpeg/)
  })

  it('accepts magic-valid tiny JPEG buffer', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FAKE_BUT_MAGIC_JPEG, {
        filename: 'tiny.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(201)
    expect(res.body.image.path).toMatch(/^uploads\//)
  })
})
