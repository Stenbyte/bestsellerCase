import type { TicketStatus } from '@recolour/core'

export type TicketAction = 'send' | 'partner_progress' | 'approve' | 'reject'

const PARTNER_NEXT: Partial<Record<TicketStatus, TicketStatus>> = {
  sent: 'in_progress',
  in_progress: 'completed',
}


export function nextStatus(
  current: TicketStatus,
  action: TicketAction,
): TicketStatus | null {
  switch (action) {
    case 'send':
      return current === 'pending' ? 'sent' : null
    case 'partner_progress':
      return PARTNER_NEXT[current] ?? null
    case 'approve':
      return current === 'completed' ? 'completed' : null
    case 'reject':
      return current === 'completed' ? 'pending' : null
    default:
      return null
  }
}
