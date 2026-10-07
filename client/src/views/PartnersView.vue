<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useTickets } from '@/composables/useTickets'
import { formatWhen } from '@/utils/assets'
import type { Partner, Ticket } from '@recolour/core'

const { loadPartners, loadTickets, tickets } = useTickets()

const partners = ref<Partner[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

interface PartnerRow {
  partner: Partner
  openCount: number
  lastActivity: string | null
}

const rows = computed<PartnerRow[]>(() =>
  partners.value.map((partner) => {
    const related = tickets.value.filter((t: Ticket) => t.partnerId === partner.id)
    const last = related
      .map((t) => t.updatedAt)
      .sort()
      .at(-1)
    return {
      partner,
      openCount: related.length,
      lastActivity: last ?? null,
    }
  }),
)

onMounted(async () => {
  try {
    ;[partners.value] = await Promise.all([loadPartners(), loadTickets()])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load partners'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page">
    <header class="page__head">
      <div>
        <h1>Partners</h1>
        <p class="lede">Who is handling open queue work.</p>
      </div>
    </header>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Partner</th>
          <th>Open tickets</th>
          <th>Last activity</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.partner.id">
          <td>{{ row.partner.name }}</td>
          <td>{{ row.openCount }}</td>
          <td>{{ row.lastActivity ? formatWhen(row.lastActivity) : '—' }}</td>
          <td>
            <RouterLink :to="{ name: 'queue', query: { partnerId: row.partner.id } }">
              View in queue
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.page__head {
  margin-bottom: 1.25rem;
}

h1 {
  margin: 0 0 0.25rem;
}

.lede {
  margin: 0;
  color: var(--muted);
}

.state {
  color: var(--muted);
}

.state--error {
  color: #7a1f1f;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--line);
}

th,
td {
  text-align: left;
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid var(--line);
  font-size: 0.92rem;
}

th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: #f3f5f7;
}

.table a {
  color: var(--accent);
}
</style>
