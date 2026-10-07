import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { loginBodySchema } from '../schemas/auth.js'
import { login } from '../services/auth.js'
import type { LoginBody } from '../schemas/auth.js'

export const authRouter = Router()

authRouter.post('/login', validateBody(loginBodySchema), async (req, res, next) => {
  try {
    const { role, email } = req.body as LoginBody
    const result = await login(role, email)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export const meRouter = Router()

meRouter.get('/', authenticate, (req, res) => {
  res.json({ user: req.user })
})
