<script setup lang="ts">
import type { TicketStatus } from '@recolour/core'

defineProps<{ status: TicketStatus }>()
</script>

<template>
  <span class="badge" :data-status="status">{{ status.replace('_', ' ') }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: #e8e8e8;
  color: #333;
}

.badge[data-status='pending'] {
  background: #f3e8d4;
  color: #6a4a12;
}

.badge[data-status='sent'],
.badge[data-status='in_progress'] {
  background: #dce8f5;
  color: #1e4a7a;
}

.badge[data-status='completed'] {
  background: #d9efe0;
  color: #1d5c35;
}

.badge[data-status='rejected'] {
  background: #f5dcdc;
  color: #7a1f1f;
}
</style>
