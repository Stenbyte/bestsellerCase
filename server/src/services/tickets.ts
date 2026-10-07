import { randomUUID } from 'node:crypto'
import {
  getPartner,
  getTicket,
  insertApproved,
  insertTicket,
  listApproved,
  listTickets,
  removeTicket,
  saveTicket,
} from '../store/memory.js'
import { isAllowedImagePath } from '../store/seed.js'
import type {
  ApprovedPhoto,
  CreateTicketInput,
  Priority,
  Ticket,
  TicketStatus,
} from '../types/ticket.js'
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

function requireTicket(id: string): Ticket {
  const ticket = getTicket(id)
  if (!ticket) throw AppError.notFound('Ticket not found')
  return ticket
}

export function getTicketById(id: string): Ticket {
  return requireTicket(id)
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

function assertStatus(ticket: Ticket, expected: TicketStatus, action: string): void {
  if (ticket.status !== expected) {
    throw AppError.conflict(`Cannot ${action} ticket in status '${ticket.status}'`, {
      ticketId: ticket.id,
      from: ticket.status,
      expected,
      action,
    })
  }
}

/** Mock partner flow: pending → sent → in_progress → completed (immediate). */
export function sendTicket(id: string): Ticket {
  const ticket = requireTicket(id)
  assertStatus(ticket, 'pending', 'send')

  const now = new Date().toISOString()
  const updated: Ticket = {
    ...ticket,
    status: 'completed',
    partnerReceiptId: `rcpt-${randomUUID()}`,
    updatedAt: now,
  }
  saveTicket(updated)
  return updated
}

export function approveTicket(
  id: string,
  approvedBy: string,
): { ticketId: string; approved: ApprovedPhoto } {
  const ticket = requireTicket(id)
  assertStatus(ticket, 'completed', 'approve')

  const approved = insertApproved(ticket, approvedBy)
  removeTicket(ticket.id)

  return { ticketId: ticket.id, approved }
}

export function rejectTicket(id: string): Ticket {
  const ticket = requireTicket(id)
  assertStatus(ticket, 'completed', 'reject')

  const updated: Ticket = {
    ...ticket,
    status: 'pending',
    partnerReceiptId: undefined,
    updatedAt: new Date().toISOString(),
  }
  saveTicket(updated)
  return updated
}

export function listApprovedPhotos(): ApprovedPhoto[] {
  return listApproved()
}
