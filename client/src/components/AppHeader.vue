<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { Role } from '@recolour/core'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const { user, role } = storeToRefs(auth)

async function onRoleChange(event: Event) {
  const next = (event.target as HTMLSelectElement).value as Role
  if (!next || next === role.value) return
  try {
    await auth.switchRole(next)
    ui.setBanner(`Signed in as ${next}`, 'success')
  } catch (err) {
    ui.setBanner(err instanceof Error ? err.message : 'Role switch failed', 'error')
  }
}

function logout() {
  auth.clearSession()
  ui.clearBanner()
  void router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div class="header__brand">
      <RouterLink to="/dashboard" class="logo">Recolour</RouterLink>
      <nav class="nav" aria-label="Main">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/queue">Queue</RouterLink>
        <RouterLink to="/tickets/new">Create</RouterLink>
        <RouterLink to="/approved">Approved</RouterLink>
        <RouterLink to="/partners">Partners</RouterLink>
      </nav>
    </div>

    <div v-if="user" class="header__session">
      <span class="meta">{{ user.email }}</span>
      <label class="role-switch">
        <span class="sr-only">Role</span>
        <select :value="role ?? ''" @change="onRoleChange">
          <option value="operator">Operator</option>
          <option value="manager">Manager</option>
        </select>
      </label>
      <button type="button" class="btn btn--ghost" @click="logout">Sign out</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-decoration: none;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1rem;
}

.nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}

.nav a.router-link-active {
  color: var(--ink);
  font-weight: 600;
}

.header__session {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.meta {
  color: var(--muted);
  font-size: 0.85rem;
}

.role-switch select {
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
}
</style>
