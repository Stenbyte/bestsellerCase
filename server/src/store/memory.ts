import { randomUUID } from 'node:crypto'
import type { ApprovedPhoto, CreateTicketInput, Partner, Ticket } from '@recolour/core'
import { buildSeedTickets, SEED_PARTNERS } from './seed.js'

export interface MemoryStore {
  partners: Partner[]
  tickets: Ticket[]
  approved: ApprovedPhoto[]
}

let store: MemoryStore = createSeededStore()

function createSeededStore(): MemoryStore {
  return {
    partners: SEED_PARTNERS.map((p) => ({ ...p })),
    tickets: buildSeedTickets(),
    approved: [],
  }
}

export function getStore(): MemoryStore {
  return store
}

export function resetStore(): void {
  store = createSeededStore()
}

export function listPartners(): Partner[] {
  return store.partners
}

export function getPartner(id: string): Partner | undefined {
  return store.partners.find((p) => p.id === id)
}

export function listTickets(): Ticket[] {
  return store.tickets
}

export function getTicket(id: string): Ticket | undefined {
  return store.tickets.find((t) => t.id === id)
}

export function insertTicket(input: CreateTicketInput, createdBy: string): Ticket {
  const now = new Date().toISOString()
  const ticket: Ticket = {
    id: `ticket-${randomUUID()}`,
    ...input,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    createdBy,
  }
  store.tickets.unshift(ticket)
  return ticket
}

export function saveTicket(ticket: Ticket): Ticket {
  const index = store.tickets.findIndex((t) => t.id === ticket.id)
  if (index === -1) return ticket
  store.tickets[index] = ticket
  return ticket
}

export function removeTicket(id: string): Ticket | undefined {
  const index = store.tickets.findIndex((t) => t.id === id)
  if (index === -1) return undefined
  const [removed] = store.tickets.splice(index, 1)
  return removed
}

export function listApproved(): ApprovedPhoto[] {
  return store.approved
}

export function insertApproved(
  ticket: Ticket,
  approvedBy: string,
): ApprovedPhoto {
  const photo: ApprovedPhoto = {
    id: `approved-${randomUUID()}`,
    ticketId: ticket.id,
    photoId: ticket.photoId,
    imagePaths: [...ticket.imagePaths],
    approvedAt: new Date().toISOString(),
    approvedBy,
  }
  store.approved.unshift(photo)
  return photo
}
