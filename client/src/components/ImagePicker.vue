<script setup lang="ts">
import { computed } from 'vue'
import type { SeedImage } from '@recolour/core'

const selected = defineModel<string[]>({ required: true })

defineProps<{
  images: SeedImage[]
}>()

const selectedSet = computed(() => new Set(selected.value))

function toggle(path: string) {
  const next = selected.value.slice()
  const i = next.indexOf(path)
  if (i === -1) next.push(path)
  else next.splice(i, 1)
  selected.value = next
}
</script>

<template>
  <div class="images">
    <label v-for="img in images" :key="img.path" class="image-pick">
      <input
        type="checkbox"
        :checked="selectedSet.has(img.path)"
        @change="toggle(img.path)"
      />
      <!-- path-first UI; tiny thumb only, not full decode on every form keystroke -->
      <span class="image-pick__path">{{ img.path }}</span>
    </label>
  </div>
</template>

<style scoped>
.images {
  display: grid;
  gap: 0.4rem;
  font-weight: 400;
  max-height: 16rem;
  overflow: auto;
}

.image-pick {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  border: 1px solid var(--line);
  padding: 0.45rem 0.55rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1.3;
}

.image-pick__path {
  color: var(--ink);
  word-break: break-all;
}
</style>
