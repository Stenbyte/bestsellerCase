<script setup lang="ts">
import { onMounted, ref } from 'vue'

const health = ref<'loading' | 'ok' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { ok: boolean }
    health.value = data.ok ? 'ok' : 'error'
    message.value = JSON.stringify(data)
  } catch (err) {
    health.value = 'error'
    message.value = err instanceof Error ? err.message : 'Request failed'
  }
})
</script>

<template>
  <main class="home">
    <h1>Recolour Case</h1>
    <p>API health: <strong>{{ health }}</strong></p>
    <pre v-if="message">{{ message }}</pre>
  </main>
</template>

<style scoped>
.home {
  max-width: 40rem;
  margin: 3rem auto;
  padding: 0 1.5rem;
  font-family: Georgia, 'Times New Roman', serif;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

pre {
  background: #f3f1ec;
  padding: 0.75rem 1rem;
  overflow: auto;
}
</style>
