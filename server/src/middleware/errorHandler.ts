import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../types/errors.js'

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound('Route not found'))
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isProd = process.env.NODE_ENV === 'production'

  if (err instanceof AppError) {
    if (!isProd && err.code === 'INTERNAL') {
      console.error(err)
    }
    res.status(err.status).json(err.toBody())
    return
  }

  console.error(err)

  const message = isProd
    ? 'Internal server error'
    : err instanceof Error
      ? err.message
      : 'Internal server error'

  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message,
    },
  })
}
