import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth-store'

beforeEach(() => {
  useAuthStore.getState().signOut()
  localStorage.clear()
})

describe('auth store', () => {
  it('signs in with the demo user and persists the session', () => {
    useAuthStore.getState().signIn('priya.raman@northgate.example')
    expect(useAuthStore.getState().user?.name).toBe('Priya Raman')
    expect(localStorage.getItem('matchguard.demo.session')).toContain('Priya Raman')
  })

  it('signs out', () => {
    useAuthStore.getState().signIn('priya.raman@northgate.example')
    useAuthStore.getState().signOut()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
