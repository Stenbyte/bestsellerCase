import { z } from 'zod'
import { ROLES } from '../types/auth.js'

export const loginBodySchema = z
  .object({
    role: z.enum(ROLES),
    email: z.string().email().optional(),
  })
  .strict()

export type LoginBody = z.infer<typeof loginBodySchema>
