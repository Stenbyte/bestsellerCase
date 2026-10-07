import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import TicketDetailView from '@/views/TicketDetailView.vue'
import { clearSession, jsonResponse, mockFetch, seedSession } from './helpers'
import type { Ticket } from '@recolour/core'

const completedTicket: Ticket = {
  id: 'ticket-3',
  photoId: '15377488',
  style: 'Test style',
  priority: 'medium',
  partnerId: 'partner-pixel',
  status: 'completed',
  pantoneNotes: 'notes',
  imagePaths: ['Ticket 3/15377488_5078869_001.jpg'],
  partnerReceiptId: 'rcpt-seed-3',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'user-operator',
}

async function mountDetail(role: 'operator' | 'manager') {
  clearSession()
  seedSession(role)
  const pinia = createPinia()
  setActivePinia(pinia)

  mockFetch((url) => {
    if (url.includes('/api/tickets/ticket-3')) {
      return { ticket: completedTicket }
    }
    if (url.includes('/api/partners')) {
      return { partners: [{ id: 'partner-pixel', name: 'PixelPartner' }] }
    }
    return jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'missing' } })
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/tickets/:id', name: 'ticket-detail', component: TicketDetailView },
      { path: '/queue', name: 'queue', component: { template: '<div />' } },
    ],
  })
  await router.push('/tickets/ticket-3')
  await router.isReady()

  const wrapper = mount(TicketDetailView, {
    global: {
      plugins: [pinia, router],
    },
  })
  await flushPromises()
  return wrapper
}

describe('TicketDetailView roles', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    clearSession()
  })

  it('hides Approve / Reject for operators on completed tickets', async () => {
    const wrapper = await mountDetail('operator')
    expect(wrapper.text()).toContain('Test style')
    expect(wrapper.text()).toMatch(/Awaiting manager approval/)
    const labels = wrapper.findAll('button').map((b) => b.text())
    expect(labels).not.toContain('Approve')
    expect(labels).not.toContain('Reject')
  })

  it('shows Approve / Reject for managers on completed tickets', async () => {
    const wrapper = await mountDetail('manager')
    const labels = wrapper.findAll('button').map((b) => b.text())
    expect(labels).toContain('Approve')
    expect(labels).toContain('Reject')
  })
})
