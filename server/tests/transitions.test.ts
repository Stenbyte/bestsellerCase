import { describe, expect, it } from 'vitest'
import { nextStatus } from '../src/domain/transitions.js'

describe('status transitions', () => {
  it('send: pending → sent only', () => {
    expect(nextStatus('pending', 'send')).toBe('sent')
    expect(nextStatus('sent', 'send')).toBeNull()
    expect(nextStatus('completed', 'send')).toBeNull()
  })

  it('partner_progress: sent → in_progress → completed', () => {
    expect(nextStatus('sent', 'partner_progress')).toBe('in_progress')
    expect(nextStatus('in_progress', 'partner_progress')).toBe('completed')
    expect(nextStatus('pending', 'partner_progress')).toBeNull()
    expect(nextStatus('completed', 'partner_progress')).toBeNull()
  })

  it('reject: completed → pending', () => {
    expect(nextStatus('completed', 'reject')).toBe('pending')
    expect(nextStatus('pending', 'reject')).toBeNull()
  })

  it('approve only from completed', () => {
    expect(nextStatus('completed', 'approve')).toBe('completed')
    expect(nextStatus('sent', 'approve')).toBeNull()
  })
})
