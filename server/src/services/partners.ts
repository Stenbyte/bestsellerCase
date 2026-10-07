import { logEvent } from '../lib/telemetry.js'
import { listPartners as listFromStore } from '../store/memory.js'
import type { Partner } from '@recolour/core'

export function listPartners(): Partner[] {
  const partners = listFromStore()
  logEvent('partner.list', { count: partners.length })
  return partners
}
