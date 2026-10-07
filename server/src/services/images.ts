import { SEED_IMAGE_PATHS } from '../store/seed.js'

export function listSeedImages() {
  return SEED_IMAGE_PATHS.map((relativePath) => ({
    path: relativePath,
    url: `/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
  }))
}
