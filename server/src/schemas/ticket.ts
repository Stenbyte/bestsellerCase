import { z } from 'zod'
import { PRIORITIES, TICKET_STATUSES } from '../types/ticket.js'

export const createTicketBodySchema = z
  .object({
    photoId: z.string().trim().min(1).max(64),
    style: z.string().trim().min(1).max(200),
    priority: z.enum(PRIORITIES),
    partnerId: z.string().trim().min(1).max(64),
    pantoneNotes: z.string().trim().min(1).max(2000),
    imagePaths: z.array(z.string().trim().min(1).max(260)).min(1).max(12),
  })
  .strict()

export type CreateTicketBody = z.infer<typeof createTicketBodySchema>

export const listTicketsQuerySchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    partnerId: z.string().trim().min(1).max(64).optional(),
  })
  .strict()

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>
