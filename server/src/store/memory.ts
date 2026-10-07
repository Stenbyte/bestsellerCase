import { randomUUID } from 'node:crypto'
import type { ApprovedPhoto, CreateTicketInput, Partner, Ticket } from '../types/ticket.js'
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
