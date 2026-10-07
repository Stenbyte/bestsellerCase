import { z } from 'zod'
import { ROLES } from '@recolour/core'

export const loginBodySchema = z
  .object({
    role: z.enum(ROLES),
    email: z.string().email().optional(),
  })
  .strict()

export type LoginBody = z.infer<typeof loginBodySchema>
