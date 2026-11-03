import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signOut()
  window.history.pushState({}, '', '/dashboard')
})

describe('app shell', () => {
  it('redirects unauthenticated users to login', async () => {
    render(<App />)
    expect(await screen.findByLabelText(/work email/i)).toBeInTheDocument()
  })

  it('renders navigation for an authenticated user', async () => {
    useAuthStore.getState().signIn('priya.raman@northgate.example')
    render(<App />)
    expect(await screen.findByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /policy & guardrails/i })).toBeInTheDocument()
  })

  it('navigates through the sidebar', async () => {
    useAuthStore.getState().signIn('priya.raman@northgate.example')
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: /documents/i }))
    await waitFor(() => expect(window.location.pathname).toBe('/documents'))
  })
})
