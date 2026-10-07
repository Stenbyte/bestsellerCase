import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Role = 'operator' | 'manager'

export const useAuthStore = defineStore('auth', () => {
  const role = ref<Role | null>(null)
  const token = ref<string | null>(null)

  function setSession(nextRole: Role, nextToken: string) {
    role.value = nextRole
    token.value = nextToken
  }

  function clearSession() {
    role.value = null
    token.value = null
  }

  return { role, token, setSession, clearSession }
})
