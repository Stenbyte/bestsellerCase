import type { TicketFilters } from '@recolour/core'

export function buildTicketQuery(filters: TicketFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.partnerId) params.set('partnerId', filters.partnerId)
  return params.toString()
}
