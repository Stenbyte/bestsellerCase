<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { Role } from '@recolour/core'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const role = ref<Role>('operator')
const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await auth.login(role.value)
    ui.setBanner(`Signed in as ${role.value}`, 'success')
    await router.push({ name: 'queue' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login">
    <div class="login__card">
      <p class="eyebrow">Recolour Case</p>
      <h1>Sign in</h1>
      <p class="lede">Demo auth — pick a role. Server enforces permissions.</p>

      <form class="form" @submit.prevent="submit">
        <label>
          Role
          <select v-model="role">
            <option value="operator">Operator</option>
            <option value="manager">Manager</option>
          </select>
        </label>

        <p v-if="error" class="field-error">{{ error }}</p>

        <button class="btn btn--primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Continue' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background:
    radial-gradient(ellipse at 20% 0%, #d9e6f2 0%, transparent 50%),
    radial-gradient(ellipse at 90% 100%, #e8efe6 0%, transparent 45%),
    var(--bg);
}

.login__card {
  width: min(100%, 24rem);
  padding: 2rem;
  background: var(--surface);
  border: 1px solid var(--line);
}

.eyebrow {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--accent);
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
}

.lede {
  margin: 0 0 1.5rem;
  color: var(--muted);
  line-height: 1.45;
}

.form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
}

select {
  font: inherit;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
}
</style>
