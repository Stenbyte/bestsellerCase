export const TICKET_STATUSES = [
  'pending',
  'sent',
  'in_progress',
  'completed',
  'rejected',
] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const PRIORITIES = ['low', 'medium', 'high'] as const

export type Priority = (typeof PRIORITIES)[number]

export interface Partner {
  id: string
  name: string
}

export interface Ticket {
  id: string
  photoId: string
  style: string
  priority: Priority
  partnerId: string
  status: TicketStatus
  pantoneNotes: string
  imagePaths: string[]
  partnerReceiptId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ApprovedPhoto {
  id: string
  ticketId: string
  photoId: string
  imagePaths: string[]
  approvedAt: string
  approvedBy: string
}

export interface CreateTicketInput {
  photoId: string
  style: string
  priority: Priority
  partnerId: string
  pantoneNotes: string
  imagePaths: string[]
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  partnerId?: string
}

export interface SeedImage {
  path: string
  url: string
}
