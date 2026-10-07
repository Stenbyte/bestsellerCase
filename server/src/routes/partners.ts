import type { Router } from 'express'
import { listPartners } from '../services/partners.js'

export function registerPartners(api: Router): void {
  api.get('/partners', (_req, res, next) => {
    try {
      res.json({ partners: listPartners() })
    } catch (err) {
      next(err)
    }
  })
}
