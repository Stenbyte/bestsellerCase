import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { resetStore } from '../src/store/memory.js'
import { SEED_ROOT } from '../src/store/paths.js'
import {
  clearUploadedPathCache,
  hydrateUploadedPaths,
} from '../src/store/uploads.js'

async function loginAs(role: 'operator' | 'manager') {
  const res = await request(createApp()).post('/api/auth/login').send({ role })
  expect(res.status).toBe(200)
  return res.body.token as string
}

const FAKE_BUT_MAGIC_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x00])

const MINIMAL_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2MBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIAAEAAQMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APQKAP8A/9k=',
  'base64',
)

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

  it('rejects magic-valid but undecodable content', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FAKE_BUT_MAGIC_JPEG, {
        filename: 'tiny.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/decodable JPEG/i)
  })

  it('accepts a decodable minimal JPEG', async () => {
    const token = await loginAs('operator')
    const res = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', MINIMAL_JPEG, {
        filename: 'pixel.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(201)
    expect(res.body.image.path).toMatch(/^uploads\//)
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

  it('rehydrates allowlist from disk after in-memory cache loss', async () => {
    const token = await loginAs('operator')
    const upload = await request(createApp())
      .post('/api/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', MINIMAL_JPEG, {
        filename: 'pixel.jpg',
        contentType: 'image/jpeg',
      })
    expect(upload.status).toBe(201)

  
    clearUploadedPathCache()
    hydrateUploadedPaths()

    const create = await request(createApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoId: 'upload-restart',
        style: 'Uploaded',
        priority: 'low',
        partnerId: 'partner-colorlab',
        pantoneNotes: 'notes',
        imagePaths: [upload.body.image.path],
      })

    expect(create.status).toBe(201)
    expect(create.body.ticket.imagePaths).toEqual([upload.body.image.path])
  })
})
