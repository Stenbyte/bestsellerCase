import fs from 'node:fs'
import { UPLOAD_ROOT } from './paths.js'

/** Filenames written by saveValidatedJpeg (UUID + .jpg). */
const UPLOAD_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i

const UPLOAD_RELATIVE =
  /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i

const uploadedPaths = new Set<string>()

export function ensureUploadDir(): void {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true })
}


export function hydrateUploadedPaths(): void {
  ensureUploadDir()
  uploadedPaths.clear()
  for (const name of fs.readdirSync(UPLOAD_ROOT)) {
    if (UPLOAD_FILENAME.test(name)) {
      uploadedPaths.add(`uploads/${name}`)
    }
  }
}

export function registerUploadedPath(relativePath: string): void {
  if (!UPLOAD_RELATIVE.test(relativePath)) return
  uploadedPaths.add(relativePath)
}

export function isUploadedImagePath(imagePath: string): boolean {
  if (!UPLOAD_RELATIVE.test(imagePath)) return false
  return uploadedPaths.has(imagePath)
}


export function clearUploadedPathCache(): void {
  uploadedPaths.clear()
}

export function resetUploads(): void {
  uploadedPaths.clear()
}
