import {
  getPartner,
  getTicket,
  insertTicket,
  listTickets,
} from '../store/memory.js'
import { isAllowedImagePath } from '../store/seed.js'
import type { CreateTicketInput, Ticket, TicketStatus, Priority } from '../types/ticket.js'
import { AppError } from '../types/errors.js'

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  partnerId?: string
}

export function listTicketsFiltered(filters: TicketFilters = {}): Ticket[] {
  return listTickets().filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.partnerId && ticket.partnerId !== filters.partnerId) return false
    return true
  })
}

export function getTicketById(id: string): Ticket {
  const ticket = getTicket(id)
  if (!ticket) throw AppError.notFound('Ticket not found')
  return ticket
}

export function createTicket(input: CreateTicketInput, createdBy: string): Ticket {
  if (!getPartner(input.partnerId)) {
    throw AppError.validation('Unknown partnerId', { partnerId: input.partnerId })
  }

  const invalidPaths = input.imagePaths.filter((p) => !isAllowedImagePath(p))
  if (invalidPaths.length > 0) {
    throw AppError.validation('One or more imagePaths are not in the seed allowlist', {
      invalidPaths,
    })
  }

  return insertTicket(input, createdBy)
}
