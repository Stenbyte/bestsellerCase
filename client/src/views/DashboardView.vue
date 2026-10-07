<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useTickets } from '@/composables/useTickets'
import type { Stats } from '@recolour/core'

const { loadStats } = useTickets()

const stats = ref<Stats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    stats.value = await loadStats()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load stats'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page">
    <header class="page__head">
      <div>
        <h1>Dashboard</h1>
        <p class="lede">Queue health at a glance.</p>
      </div>
      <RouterLink class="btn btn--primary" to="/queue">Open queue</RouterLink>
    </header>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>

    <template v-else-if="stats">
      <div class="kpis">
        <article class="kpi">
          <p class="kpi__label">Pending</p>
          <p class="kpi__value">{{ stats.pending }}</p>
        </article>
        <article class="kpi">
          <p class="kpi__label">In flight</p>
          <p class="kpi__value">{{ stats.inFlight }}</p>
        </article>
        <article class="kpi">
          <p class="kpi__label">Awaiting approval</p>
          <p class="kpi__value">{{ stats.awaitingApproval }}</p>
        </article>
        <article class="kpi">
          <p class="kpi__label">Approved library</p>
          <p class="kpi__value">{{ stats.approved }}</p>
        </article>
        <article class="kpi">
          <p class="kpi__label">In queue</p>
          <p class="kpi__value">{{ stats.totalInQueue }}</p>
        </article>
      </div>

      <div class="panel">
        <h2>By status</h2>
        <ul class="status-list">
          <li v-for="(count, status) in stats.byStatus" :key="status">
            <span class="cap">{{ String(status).replace('_', ' ') }}</span>
            <strong>{{ count }}</strong>
          </li>
        </ul>
      </div>
    </template>
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

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.kpi {
  padding: 1rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
}

.kpi__label {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.kpi__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
}

.panel {
  padding: 1rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
}

.panel h2 {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.status-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.status-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--line);
  font-size: 0.95rem;
}

.status-list li:last-child {
  border-bottom: 0;
}

.cap {
  text-transform: capitalize;
}
</style>
