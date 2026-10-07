import { ApiError, type ApiErrorBody } from '@/types/api'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { json?: unknown; formData?: FormData } = {},
): Promise<T> {
  const auth = useAuthStore()
  const ui = useUiStore()
  const headers = new Headers(options.headers)

  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`)
  }

  const { json, formData, ...rest } = options
  const res = await fetch(path, {
    ...rest,
    headers,
    body:
      formData !== undefined
        ? formData
        : json !== undefined
          ? JSON.stringify(json)
          : rest.body,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const data = (await res.json().catch(() => null)) as ApiErrorBody | T | null

  if (!res.ok) {
    const errBody =
      data && typeof data === 'object' && 'error' in data
        ? (data as ApiErrorBody).error
        : { code: 'INTERNAL' as const, message: `HTTP ${res.status}` }
    const err = new ApiError(res.status, errBody)

    if (err.code === 'UNAUTHORIZED') {
      auth.clearSession()
      ui.setBanner('Session expired. Sign in again.', 'error')
    } else if (err.code === 'FORBIDDEN' || err.code === 'CONFLICT') {
      ui.setBanner(err.message, 'error')
    }

    throw err
  }

  return data as T
}
