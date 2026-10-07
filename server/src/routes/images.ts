import type { Router } from 'express'
import { listSeedImages } from '../services/images.js'

export function registerImages(api: Router): void {
  api.get('/images', (_req, res, next) => {
    try {
      res.json({ images: listSeedImages() })
    } catch (err) {
      next(err)
    }
  })
}
