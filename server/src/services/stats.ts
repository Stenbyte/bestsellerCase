import { TICKET_STATUSES, type Stats, type TicketStatus } from '@recolour/core'
import { logEvent } from '../lib/telemetry.js'
import { listApproved, listTickets } from '../store/memory.js'

export type { Stats }

export function getStats(): Stats {
  const tickets = listTickets()
  const byStatus = Object.fromEntries(
    TICKET_STATUSES.map((status) => [status, 0]),
  ) as Record<TicketStatus, number>

  for (const ticket of tickets) {
    byStatus[ticket.status] += 1
  }

  const stats: Stats = {
    byStatus,
    pending: byStatus.pending,
    awaitingApproval: byStatus.completed,
    inFlight: byStatus.sent + byStatus.in_progress,
    approved: listApproved().length,
    totalInQueue: tickets.length,
  }
  logEvent('stats.get', {
    pending: stats.pending,
    awaitingApproval: stats.awaitingApproval,
    approved: stats.approved,
  })
  return stats
}
