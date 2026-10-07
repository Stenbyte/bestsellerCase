import { listPartners as listFromStore } from '../store/memory.js'
import type { Partner } from '../types/ticket.js'

export function listPartners(): Partner[] {
  return listFromStore()
}
