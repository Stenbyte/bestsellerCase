import type { Router } from 'express'
import { getStats } from '../services/stats.js'

export function registerStats(api: Router): void {
  api.get('/stats', (_req, res, next) => {
    try {
      res.json({ stats: getStats() })
    } catch (err) {
      next(err)
    }
  })
}
