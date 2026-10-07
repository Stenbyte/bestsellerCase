import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../services/auth.js'
import type { Role } from '../types/auth.js'
import { AppError } from '../types/errors.js'

function extractBearerToken(req: Request): string | null {
  const header = req.header('authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req)
    if (!token) {
      next(AppError.unauthorized('Missing Bearer token'))
      return
    }

    req.user = await verifyToken(token)
    next()
  } catch (err) {
    next(err)
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(AppError.unauthorized())
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient role'))
      return
    }

    next()
  }
}
