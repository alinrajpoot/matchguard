import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import SettingsPage from './SettingsPage'
import { db, resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider><MemoryRouter><SettingsPage /></MemoryRouter></TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('settings', () => {
  it('saves the profile', async () => {
    const user = userEvent.setup()
    renderPage()
    const name = await screen.findByLabelText(/^name$/i)
    await user.clear(name)
    await user.type(name, 'Priya R.')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(db.user.name).toBe('Priya R.'))
  })

  it('resets demo data after confirmation', async () => {
    const user = userEvent.setup()
    db.user.name = 'Changed Name'
    renderPage()
    await user.click(await screen.findByRole('button', { name: /reset demo data/i }))
    await user.click(await screen.findByRole('button', { name: /^reset$/i }))
    await waitFor(() => expect(db.user.name).toBe('Priya Raman'))
  })
})
