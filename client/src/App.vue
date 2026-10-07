<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppBanner from '@/components/AppBanner.vue'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const showChrome = computed(() => !route.meta.public)
</script>

<template>
  <div class="app">
    <AppHeader v-if="showChrome" />
    <AppBanner />
    <main class="app__main" :class="{ 'app__main--chrome': showChrome }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app__main--chrome {
  padding: 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
}
</style>
