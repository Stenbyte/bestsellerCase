<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import { ApiError } from '@/types/api'
import { useTickets } from '@/composables/useTickets'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { Partner, Ticket } from '@recolour/core'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { getTicket, sendTicket, approveTicket, rejectTicket, loadPartners } = useTickets()

const ticket = ref<Ticket | null>(null)
const partners = ref<Partner[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const busy = ref(false)

const id = computed(() => String(route.params.id))
const partnerName = computed(
  () => partners.value.find((p) => p.id === ticket.value?.partnerId)?.name ?? ticket.value?.partnerId,
)

function assetUrl(path: string) {
  return `/assets/${path.split('/').map(encodeURIComponent).join('/')}`
}

const canSend = computed(() => ticket.value?.status === 'pending')
const canReview = computed(
  () => auth.isManager && ticket.value?.status === 'completed',
)

async function load() {
  loading.value = true
  error.value = null
  try {
    ;[ticket.value, partners.value] = await Promise.all([
      getTicket(id.value),
      loadPartners(),
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load ticket'
    ticket.value = null
  } finally {
    loading.value = false
  }
}

async function runAction(action: 'send' | 'approve' | 'reject') {
  busy.value = true
  try {
    if (action === 'send') {
      ticket.value = await sendTicket(id.value)
      ui.setBanner('Sent to partner (mock → completed)', 'success')
    } else if (action === 'approve') {
      await approveTicket(id.value)
      ui.setBanner('Ticket approved', 'success')
      await router.push({ name: 'queue' })
    } else {
      ticket.value = await rejectTicket(id.value)
      ui.setBanner('Rejected — back to pending', 'info')
    }
  } catch (err) {
    if (!(err instanceof ApiError && (err.code === 'FORBIDDEN' || err.code === 'CONFLICT'))) {
      ui.setBanner(err instanceof Error ? err.message : 'Action failed', 'error')
    }
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="page">
    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>

    <template v-else-if="ticket">
      <header class="page__head">
        <div>
          <p class="eyebrow">{{ ticket.photoId }}</p>
          <h1>{{ ticket.style }}</h1>
          <div class="meta">
            <StatusBadge :status="ticket.status" />
            <span class="cap">{{ ticket.priority }}</span>
            <span>{{ partnerName }}</span>
          </div>
        </div>
        <div class="actions">
          <button
            v-if="canSend"
            type="button"
            class="btn btn--primary"
            :disabled="busy"
            @click="runAction('send')"
          >
            Send to partner
          </button>
          <button
            v-if="canReview"
            type="button"
            class="btn btn--primary"
            :disabled="busy"
            @click="runAction('approve')"
          >
            Approve
          </button>
          <button
            v-if="canReview"
            type="button"
            class="btn btn--ghost"
            :disabled="busy"
            @click="runAction('reject')"
          >
            Reject
          </button>
        </div>
      </header>

      <p v-if="ticket.status === 'completed' && !auth.isManager" class="hint">
        Awaiting manager approval. Approve / Reject are manager-only.
      </p>

      <div class="panel">
        <h2>Pantone notes</h2>
        <p>{{ ticket.pantoneNotes }}</p>
        <p v-if="ticket.partnerReceiptId" class="receipt">
          Receipt: {{ ticket.partnerReceiptId }}
        </p>
      </div>

      <div class="gallery">
        <img
          v-for="path in ticket.imagePaths"
          :key="path"
          :src="assetUrl(path)"
          :alt="path"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.page__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--muted);
  font-size: 0.85rem;
}

h1 {
  margin: 0 0 0.6rem;
  font-size: 1.6rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.cap {
  text-transform: capitalize;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.hint {
  color: var(--muted);
  font-size: 0.9rem;
}

.panel {
  padding: 1rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  margin-bottom: 1rem;
}

.panel h2 {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.panel p {
  margin: 0;
  line-height: 1.5;
}

.receipt {
  margin-top: 0.75rem !important;
  font-size: 0.85rem;
  color: var(--muted);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.65rem;
}

.gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid var(--line);
  background: #fff;
}

.state {
  color: var(--muted);
}

.state--error {
  color: #7a1f1f;
}
</style>
