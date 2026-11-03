import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import ReviewPage from './ReviewPage'
import { db, resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/review/MR-2025-1042']}>
          <Routes>
            <Route path="/review/:matchId" element={<ReviewPage />} />
            <Route path="/queue" element={<div>Queue target</div>} />
          </Routes>
          <LocationProbe />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('match review', () => {
  it('requires a 10-character reason before approving', async () => {
    const user = userEvent.setup()
    renderPage()
    const approve = await screen.findByRole('button', { name: /approve & release/i })
    expect(approve).toBeDisabled()
    await user.type(screen.getByLabelText(/reason for decision/i), 'short')
    expect(approve).toBeDisabled()
    await user.type(screen.getByLabelText(/reason for decision/i), ' but now long enough')
    expect(approve).toBeEnabled()
  })

  it('approves, removes the queue item, records audit, and returns to the queue', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(await screen.findByLabelText(/reason for decision/i), 'Vendor amendment on file for this increase.')
    await user.click(screen.getByRole('button', { name: /approve & release/i }))
    await waitFor(() => expect(screen.getByText('Queue target')).toBeInTheDocument())
    expect(db.queue.some((q) => q.id === 'MR-2025-1042')).toBe(false)
    expect(db.audit[0].evidence.decision).toBe('RELEASE')
  })
})
