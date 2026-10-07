import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError, type ApiErrorBody } from '@/types/api'
import type { AuthUser, Role } from '@recolour/core'

const TOKEN_KEY = 'recolour.token'
const USER_KEY = 'recolour.user'

function readStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(readStoredUser())

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed(() => user.value?.role ?? null)
  const isManager = computed(() => user.value?.role === 'manager')

  function persist(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken
    user.value = nextUser
    sessionStorage.setItem(TOKEN_KEY, nextToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  function clearSession() {
    token.value = null
    user.value = null
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  async function login(nextRole: Role, email?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email ? { role: nextRole, email } : { role: nextRole }),
    })
    const data = (await res.json().catch(() => null)) as
      | { token: string; user: AuthUser }
      | ApiErrorBody
      | null

    if (!res.ok) {
      const errBody =
        data && 'error' in data
          ? data.error
          : { code: 'INTERNAL' as const, message: `HTTP ${res.status}` }
      throw new ApiError(res.status, errBody)
    }

    const ok = data as { token: string; user: AuthUser }
    persist(ok.token, ok.user)
    return ok.user
  }

  async function switchRole(nextRole: Role) {
    return login(nextRole)
  }

  return {
    token,
    user,
    role,
    isAuthenticated,
    isManager,
    login,
    switchRole,
    clearSession,
  }
})
