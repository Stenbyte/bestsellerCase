import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { logEvent } from '../lib/telemetry.js'
import { AppError } from '../types/errors.js'
import { UPLOAD_ROOT } from '../store/paths.js'
import {
  ensureUploadDir,
  registerUploadedPath,
} from '../store/uploads.js'

/** Seed product shots are ~12MB; keep headroom for demo uploads. */
const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg'])

export interface UploadedImage {
  path: string
  url: string
}

function isJpegMagic(buf: Buffer): boolean {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
}

export async function saveValidatedJpeg(file: {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}): Promise<UploadedImage> {
  const name = file.originalname.toLowerCase()
  if (name.endsWith('.svg') || file.mimetype.includes('svg')) {
    throw AppError.validation('SVG uploads are not allowed')
  }

  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw AppError.validation('Only JPEG images are allowed', {
      mimetype: file.mimetype,
    })
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw AppError.validation('File must be between 1 byte and 20MB', {
      size: file.size,
      maxBytes: MAX_BYTES,
    })
  }

  if (!isJpegMagic(file.buffer)) {
    throw AppError.validation('File content is not a valid JPEG (magic bytes)')
  }

  ensureUploadDir()
  const filename = `${randomUUID()}.jpg`
  const relativePath = `uploads/${filename}`
  await fs.writeFile(path.join(UPLOAD_ROOT, filename), file.buffer)
  registerUploadedPath(relativePath)

  const image = {
    path: relativePath,
    url: `/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
  }
  logEvent('image.upload', { path: image.path, bytes: file.size })
  return image
}
