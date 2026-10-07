import type { AuthUser } from '@recolour/core'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export {}
