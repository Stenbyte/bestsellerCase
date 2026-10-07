import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import TicketCreateView from '@/views/TicketCreateView.vue'
import { clearSession, jsonResponse, mockFetch, seedSession } from './helpers'

describe('TicketCreateView validation', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    clearSession()
    seedSession('operator')
    setActivePinia(createPinia())
  })

  it('surfaces API VALIDATION_ERROR field details', async () => {
    mockFetch((url, init) => {
      if (url.includes('/api/partners')) {
        return { partners: [{ id: 'partner-colorlab', name: 'ColorLab' }] }
      }
      if (url.includes('/api/images')) {
        return { images: [] }
      }
      if (url.includes('/api/tickets') && init?.method === 'POST') {
        return jsonResponse(400, {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body validation failed',
            details: {
              fieldErrors: {
                photoId: ['Too small: expected string to have >=1 characters'],
                imagePaths: ['Too small: expected array to have >=1 items'],
              },
              formErrors: [],
            },
          },
        })
      }
      return jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'missing' } })
    })

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/tickets/new', name: 'ticket-create', component: TicketCreateView },
        {
          path: '/tickets/:id',
          name: 'ticket-detail',
          component: { template: '<div />' },
        },
      ],
    })
    await router.push('/tickets/new')
    await router.isReady()

    const wrapper = mount(TicketCreateView, {
      global: { plugins: [createPinia(), router] },
    })
    await flushPromises()

    await wrapper.get('#photoId').setValue('x')
    await wrapper.get('#style').setValue('Style')
    await wrapper.get('#pantoneNotes').setValue('Notes')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Request body validation failed')
    expect(wrapper.text()).toContain('expected string to have >=1 characters')
    expect(wrapper.text()).toContain('expected array to have >=1 items')
  })
})
