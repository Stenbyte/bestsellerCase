import { randomUUID } from 'node:crypto'
import { nextStatus } from '../domain/transitions.js'
import { logEvent } from '../lib/telemetry.js'
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
  Ticket,
  TicketFilters,
  TicketStatus,
} from '@recolour/core'
import { AppError } from '../types/errors.js'

export type { TicketFilters }

export function listTicketsFiltered(filters: TicketFilters = {}): Ticket[] {
  const tickets = listTickets().filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.partnerId && ticket.partnerId !== filters.partnerId) return false
    return true
  })
  logEvent('ticket.list', { count: tickets.length, filters })
  return tickets
}

function requireTicket(id: string): Ticket {
  const ticket = getTicket(id)
  if (!ticket) throw AppError.notFound('Ticket not found')
  return ticket
}

function requireTransition(
  ticket: Ticket,
  action: 'send' | 'partner_progress' | 'approve' | 'reject',
): TicketStatus {
  const next = nextStatus(ticket.status, action)
  if (!next) {
    throw AppError.conflict(`Cannot ${action} ticket in status '${ticket.status}'`, {
      ticketId: ticket.id,
      from: ticket.status,
      action,
    })
  }
  return next
}

export function getTicketById(id: string): Ticket {
  const ticket = requireTicket(id)
  logEvent('ticket.get', { ticketId: id, status: ticket.status })
  return ticket
}

export function createTicket(input: CreateTicketInput, createdBy: string): Ticket {
  if (!getPartner(input.partnerId)) {
    throw AppError.validation('Unknown partnerId', { partnerId: input.partnerId })
  }

  const invalidPaths = input.imagePaths.filter((p) => !isAllowedImagePath(p))
  if (invalidPaths.length > 0) {
    throw AppError.validation('One or more imagePaths are not allowlisted', {
      invalidPaths,
    })
  }

  const ticket = insertTicket(input, createdBy)
  logEvent('ticket.create', {
    ticketId: ticket.id,
    createdBy,
    partnerId: ticket.partnerId,
    priority: ticket.priority,
  })
  return ticket
}

export function sendTicket(id: string, actorId: string): Ticket {
  const ticket = requireTicket(id)
  const status = requireTransition(ticket, 'send')

  const now = new Date().toISOString()
  const updated: Ticket = {
    ...ticket,
    status,
    partnerReceiptId: `rcpt-${randomUUID()}`,
    updatedAt: now,
  }
  saveTicket(updated)

  logEvent('ticket.send', {
    ticketId: updated.id,
    actorId,
    partnerId: updated.partnerId,
    partnerReceiptId: updated.partnerReceiptId,
    to: status,
  })
  return updated
}

export function progressPartnerTicket(id: string): Ticket {
  const ticket = requireTicket(id)
  const from = ticket.status
  const status = requireTransition(ticket, 'partner_progress')

  const updated: Ticket = {
    ...ticket,
    status,
    updatedAt: new Date().toISOString(),
  }
  saveTicket(updated)

  logEvent('ticket.partner_progress', {
    ticketId: updated.id,
    from,
    to: status,
    partnerReceiptId: updated.partnerReceiptId,
  })
  return updated
}

export function approveTicket(
  id: string,
  approvedBy: string,
): { ticketId: string; approved: ApprovedPhoto } {
  const ticket = requireTicket(id)
  requireTransition(ticket, 'approve')

  const approved = insertApproved(ticket, approvedBy)
  removeTicket(ticket.id)

  logEvent('ticket.approve', {
    ticketId: ticket.id,
    approvedId: approved.id,
    approvedBy,
    photoId: ticket.photoId,
  })
  return { ticketId: ticket.id, approved }
}

/** Manager reject: completed → pending (back on queue). */
export function rejectTicket(id: string, actorId: string): Ticket {
  const ticket = requireTicket(id)
  const status = requireTransition(ticket, 'reject')

  const updated: Ticket = {
    ...ticket,
    status,
    partnerReceiptId: undefined,
    updatedAt: new Date().toISOString(),
  }
  saveTicket(updated)

  logEvent('ticket.reject', {
    ticketId: updated.id,
    actorId,
    from: 'completed',
    to: status,
  })
  return updated
}

export function listApprovedPhotos(): ApprovedPhoto[] {
  const approved = listApproved()
  logEvent('approved.list', { count: approved.length })
  return approved
}
