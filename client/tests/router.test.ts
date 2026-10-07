import { beforeEach, describe, expect, it } from 'vitest'
import { createAppRouter } from '@/router'
import { clearSession, resetPinia, seedSession } from './helpers'

describe('router guards', () => {
  beforeEach(() => {
    clearSession()
    resetPinia()
  })

  it('sends unauthenticated users to login', async () => {
    const router = createAppRouter()
    await router.push('/queue')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/queue')
  })

  it('allows authenticated users into the queue', async () => {
    seedSession('operator')
    resetPinia()
    const router = createAppRouter()
    await router.push('/queue')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('queue')
  })

  it('redirects authenticated users away from login', async () => {
    seedSession('manager')
    resetPinia()
    const router = createAppRouter()
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
