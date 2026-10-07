<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const { banner, tone } = storeToRefs(ui)
</script>

<template>
  <div v-if="banner" class="banner" :data-tone="tone" role="alert">
    <p>{{ banner }}</p>
    <button type="button" class="banner__close" @click="ui.clearBanner()">Dismiss</button>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.banner[data-tone='error'] {
  background: #fde8e8;
  color: #7a1f1f;
}

.banner[data-tone='success'] {
  background: #e5f4ea;
  color: #1d5c35;
}

.banner[data-tone='info'] {
  background: #e8eef8;
  color: #1e3a5f;
}

.banner p {
  margin: 0;
}

.banner__close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  font: inherit;
}
</style>
