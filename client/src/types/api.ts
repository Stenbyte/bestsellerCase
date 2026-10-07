import type { ApiErrorBody, ErrorCode } from '@recolour/core'

export type { ApiErrorBody, ErrorCode, ZodFlatDetails } from '@recolour/core'

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly details?: unknown

  constructor(status: number, body: ApiErrorBody['error']) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}
