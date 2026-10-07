<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTickets } from '@/composables/useTickets'
import { assetUrl, formatWhen } from '@/utils/assets'
import type { ApprovedPhoto } from '@recolour/core'

const { loadApproved } = useTickets()

const approved = ref<ApprovedPhoto[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    approved.value = await loadApproved()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load approved photos'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page">
    <header class="page__head">
      <div>
        <h1>Approved library</h1>
        <p class="lede">Photos cleared by a manager.</p>
      </div>
    </header>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>
    <p v-else-if="approved.length === 0" class="state">
      Nothing approved yet. Complete a ticket, then approve it as manager.
    </p>

    <div v-else class="grid">
      <article v-for="item in approved" :key="item.id" class="card">
        <div class="thumbs">
          <img
            v-for="path in item.imagePaths"
            :key="path"
            :src="assetUrl(path)"
            :alt="path"
            loading="lazy"
          />
        </div>
        <div class="meta">
          <h2>{{ item.photoId }}</h2>
          <p>Approved {{ formatWhen(item.approvedAt) }}</p>
          <p class="muted">by {{ item.approvedBy }} · ticket {{ item.ticketId }}</p>
        </div>
      </article>
    </div>
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

.grid {
  display: grid;
  gap: 1rem;
}

.card {
  display: grid;
  gap: 0.85rem;
  padding: 0.85rem;
  background: var(--surface);
  border: 1px solid var(--line);
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: 0.5rem;
}

.thumbs img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid var(--line);
  background: #fff;
}

.meta h2 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}

.meta p {
  margin: 0.15rem 0;
  font-size: 0.9rem;
}

.muted {
  color: var(--muted);
}
</style>
