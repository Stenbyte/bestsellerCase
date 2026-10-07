import fs from 'node:fs'
import { UPLOAD_ROOT } from './paths.js'

const uploadedPaths = new Set<string>()

export function ensureUploadDir(): void {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true })
}

export function registerUploadedPath(relativePath: string): void {
  uploadedPaths.add(relativePath)
}

export function isUploadedImagePath(imagePath: string): boolean {
  return uploadedPaths.has(imagePath)
}

export function resetUploads(): void {
  uploadedPaths.clear()
}
