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

/** Shape of Zod `flattenError` when returned as VALIDATION_ERROR.details */
export interface ZodFlatDetails {
  formErrors?: string[]
  fieldErrors?: Record<string, string[] | undefined>
}
