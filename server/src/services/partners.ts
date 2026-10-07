import { listPartners as listFromStore } from '../store/memory.js'
import type { Partner } from '@recolour/core'

export function listPartners(): Partner[] {
  return listFromStore()
}
