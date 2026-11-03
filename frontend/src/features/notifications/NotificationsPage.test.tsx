import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import NotificationsPage from './NotificationsPage'
import { db, resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider><MemoryRouter><NotificationsPage /></MemoryRouter></TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('notifications', () => {
  it('marks all notifications read', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /mark all read/i }))
    await waitFor(() => expect(db.notifications.every((n) => !n.unread)).toBe(true))
  })
})
