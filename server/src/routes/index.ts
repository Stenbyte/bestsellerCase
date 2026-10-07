import type { Express, Router } from 'express'
import { Router as createRouter } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { ROLES } from '../types/auth.js'
import { registerAuthLogin, registerMe } from './auth.js'
import { registerImages } from './images.js'
import { registerPartners } from './partners.js'
import { registerTickets } from './tickets.js'

export function createProtectedApi(): Router {
  const api = createRouter()
  api.use(authenticate)
  api.use(authorize(...ROLES))
  return api
}

export function registerRoutes(app: Express): void {
  registerAuthLogin(app)

  const api = createProtectedApi()
  registerMe(api)
  registerTickets(api)
  registerPartners(api)
  registerImages(api)
  app.use('/api', api)
}
