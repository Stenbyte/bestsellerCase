import { listApproved, listTickets } from '../store/memory.js'
import { TICKET_STATUSES, type Stats, type TicketStatus } from '@recolour/core'

export type { Stats }

export function getStats(): Stats {
  const tickets = listTickets()
  const byStatus = Object.fromEntries(
    TICKET_STATUSES.map((status) => [status, 0]),
  ) as Record<TicketStatus, number>

  for (const ticket of tickets) {
    byStatus[ticket.status] += 1
  }

  return {
    byStatus,
    pending: byStatus.pending,
    awaitingApproval: byStatus.completed,
    inFlight: byStatus.sent + byStatus.in_progress,
    approved: listApproved().length,
    totalInQueue: tickets.length,
  }
}
