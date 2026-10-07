import { ref } from 'vue'
import { apiFetch } from '@/composables/useApi'
import type {
  ApprovedPhoto,
  CreateTicketInput,
  Partner,
  SeedImage,
  Stats,
  Ticket,
  TicketFilters,
} from '@recolour/core'

export function useTickets() {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadTickets(filters: TicketFilters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.partnerId) params.set('partnerId', filters.partnerId)
      const qs = params.toString()
      const data = await apiFetch<{ tickets: Ticket[] }>(
        `/api/tickets${qs ? `?${qs}` : ''}`,
      )
      tickets.value = data.tickets
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tickets'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getTicket(id: string) {
    const data = await apiFetch<{ ticket: Ticket }>(`/api/tickets/${id}`)
    return data.ticket
  }

  async function createTicket(input: CreateTicketInput) {
    const data = await apiFetch<{ ticket: Ticket }>('/api/tickets', {
      method: 'POST',
      json: input,
    })
    return data.ticket
  }

  async function sendTicket(id: string) {
    const data = await apiFetch<{ ticket: Ticket }>(`/api/tickets/${id}/send`, {
      method: 'POST',
    })
    return data.ticket
  }

  async function approveTicket(id: string) {
    return apiFetch<{ ticketId: string; approved: unknown }>(
      `/api/tickets/${id}/approve`,
      { method: 'POST' },
    )
  }

  async function rejectTicket(id: string) {
    const data = await apiFetch<{ ticket: Ticket }>(`/api/tickets/${id}/reject`, {
      method: 'POST',
    })
    return data.ticket
  }

  async function loadPartners() {
    const data = await apiFetch<{ partners: Partner[] }>('/api/partners')
    return data.partners
  }

  async function loadImages() {
    const data = await apiFetch<{ images: SeedImage[] }>('/api/images')
    return data.images
  }

  async function loadApproved() {
    const data = await apiFetch<{ approved: ApprovedPhoto[] }>('/api/approved')
    return data.approved
  }

  async function loadStats() {
    const data = await apiFetch<{ stats: Stats }>('/api/stats')
    return data.stats
  }

  async function uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const data = await apiFetch<{ image: SeedImage }>('/api/uploads', {
      method: 'POST',
      formData,
    })
    return data.image
  }

  return {
    tickets,
    loading,
    error,
    loadTickets,
    getTicket,
    createTicket,
    sendTicket,
    approveTicket,
    rejectTicket,
    loadPartners,
    loadImages,
    loadApproved,
    loadStats,
    uploadImage,
  }
}
