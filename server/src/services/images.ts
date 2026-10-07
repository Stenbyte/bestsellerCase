import { logEvent } from '../lib/telemetry.js'
import { SEED_IMAGE_PATHS } from '../store/seed.js'

export function listSeedImages() {
  const images = SEED_IMAGE_PATHS.map((relativePath) => ({
    path: relativePath,
    url: `/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
  }))
  logEvent('image.list', { count: images.length })
  return images
}
