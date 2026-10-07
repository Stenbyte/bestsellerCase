import type { Express, Router } from 'express'
import { Router as createRouter } from 'express'
import { validateBody } from '../middleware/validate.js'
import { loginBodySchema } from '../schemas/auth.js'
import { login } from '../services/auth.js'
import type { LoginBody } from '../schemas/auth.js'

/** Public: POST /api/auth/login */
export function registerAuthLogin(app: Express): void {
  const auth = createRouter()
  auth.post('/login', validateBody(loginBodySchema), async (req, res, next) => {
    try {
      const { role, email } = req.body as LoginBody
      const result = await login(role, email)
      res.json(result)
    } catch (err) {
      next(err)
    }
  })
  app.use('/api/auth', auth)
}

/** Protected: GET /api/me */
export function registerMe(api: Router): void {
  api.get('/me', (req, res) => {
    res.json({ user: req.user })
  })
}
