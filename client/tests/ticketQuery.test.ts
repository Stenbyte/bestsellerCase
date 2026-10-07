import { describe, expect, it } from 'vitest'
import { buildTicketQuery } from '@/composables/ticketQuery'

describe('buildTicketQuery', () => {
  it('returns empty string with no filters', () => {
    expect(buildTicketQuery()).toBe('')
  })

  it('serializes status, priority, and partnerId', () => {
    expect(
      buildTicketQuery({
        status: 'pending',
        priority: 'high',
        partnerId: 'partner-colorlab',
      }),
    ).toBe('status=pending&priority=high&partnerId=partner-colorlab')
  })

  it('omits unset filters', () => {
    expect(buildTicketQuery({ status: 'completed' })).toBe('status=completed')
  })
})
