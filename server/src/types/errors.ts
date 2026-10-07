export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export interface ApiErrorBody {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = STATUS_BY_CODE[code]
    this.details = details
  }

  static validation(message: string, details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, details)
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message)
  }

  static forbidden(message = 'Forbidden') {
    return new AppError('FORBIDDEN', message)
  }

  static notFound(message = 'Not found') {
    return new AppError('NOT_FOUND', message)
  }

  static conflict(message: string, details?: unknown) {
    return new AppError('CONFLICT', message, details)
  }

  static internal(message = 'Internal server error') {
    return new AppError('INTERNAL', message)
  }

  toBody(): ApiErrorBody {
    const body: ApiErrorBody = {
      error: {
        code: this.code,
        message: this.message,
      },
    }
    if (this.details !== undefined) {
      body.error.details = this.details
    }
    return body
  }
}
