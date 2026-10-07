import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import type { Role } from '@recolour/core'

export function resetPinia() {
  setActivePinia(createPinia())
}

export function seedSession(role: Role) {
  sessionStorage.setItem('recolour.token', 'test-token')
  sessionStorage.setItem(
    'recolour.user',
    JSON.stringify({
      id: `user-${role}`,
      email: `${role}@recolour.demo`,
      role,
    }),
  )
}

export function clearSession() {
  sessionStorage.clear()
}

/** Stub fetch; return a Response or a JSON-serializable body (status 200). */
export function mockFetch(
  handler: (url: string, init?: RequestInit) => unknown | Promise<unknown>,
) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      const payload = await handler(url, init)
      if (payload instanceof Response) return payload
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
}

export function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
