import type { NextFunction, Request, Response } from 'express'
import { type ZodType, z } from 'zod'
import { AppError } from '../types/errors.js'

export function validateBody<T extends ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(
        AppError.validation('Request body validation failed', z.flattenError(result.error)),
      )
      return
    }
    req.body = result.data
    next()
  }
}

export function validateQuery<T extends ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      next(
        AppError.validation('Request query validation failed', z.flattenError(result.error)),
      )
      return
    }
    Object.defineProperty(req, 'query', {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    })
    next()
  }
}
