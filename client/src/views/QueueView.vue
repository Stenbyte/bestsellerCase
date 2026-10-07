<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import { RouterLink } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import { useTickets } from '@/composables/useTickets'
import {
  PRIORITIES,
  TICKET_STATUSES,
  type Partner,
  type Priority,
  type TicketStatus,
} from '@recolour/core'

const { tickets, loading, error, loadTickets, loadPartners } = useTickets()

const filters = reactive<{
  status: TicketStatus | ''
  priority: Priority | ''
  partnerId: string
}>({
  status: '',
  priority: '',
  partnerId: '',
})

const partners = reactive<{ list: Partner[] }>({ list: [] })

async function refresh() {
  await loadTickets({
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    partnerId: filters.partnerId || undefined,
  })
}

onMounted(async () => {
  partners.list = await loadPartners()
  await refresh()
})

watch(filters, () => {
  void refresh()
})
</script>

<template>
  <section class="page">
    <header class="page__head">
      <div>
        <h1>Queue</h1>
        <p class="lede">Filter and open tickets. Actions live on the detail page.</p>
      </div>
      <RouterLink class="btn btn--primary" to="/tickets/new">New ticket</RouterLink>
    </header>

    <div class="filters">
      <label>
        Status
        <select v-model="filters.status">
          <option value="">All</option>
          <option v-for="s in TICKET_STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label>
        Priority
        <select v-model="filters.priority">
          <option value="">All</option>
          <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <label>
        Partner
        <select v-model="filters.partnerId">
          <option value="">All</option>
          <option v-for="p in partners.list" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
    </div>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>
    <p v-else-if="tickets.length === 0" class="state">No tickets match these filters.</p>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Photo</th>
          <th>Style</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Partner</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>{{ ticket.photoId }}</td>
          <td>{{ ticket.style }}</td>
          <td><StatusBadge :status="ticket.status" /></td>
          <td class="cap">{{ ticket.priority }}</td>
          <td>{{ partners.list.find((p) => p.id === ticket.partnerId)?.name ?? ticket.partnerId }}</td>
          <td>
            <RouterLink :to="`/tickets/${ticket.id}`">Open</RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.page__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
}

.lede {
  margin: 0;
  color: var(--muted);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filters label {
  display: grid;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.filters select {
  font: inherit;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
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
  vertical-align: middle;
}

th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: #f3f5f7;
}

.cap {
  text-transform: capitalize;
}

.table a {
  color: var(--accent);
}
</style>
