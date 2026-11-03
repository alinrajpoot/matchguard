import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import RunsPage from './RunsPage'
import { resetDb } from '@/mock/db'
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
        <MemoryRouter initialEntries={['/runs']}>
          <Routes>
            <Route path="/runs" element={<RunsPage />} />
            <Route path="/review/:matchId" element={<div>Review target</div>} />
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

describe('match runs', () => {
  it('lists runs and filters by status', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('MR-2025-1042')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Rejected' }))
    expect(screen.queryByText('MR-2025-1042')).not.toBeInTheDocument()
    expect(screen.getByText('MR-2025-1033')).toBeInTheDocument()
  })

  it('opens review for HITL rows', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByText('MR-2025-1042'))
    expect(screen.getByTestId('location')).toHaveTextContent('/review/MR-2025-1042')
    expect(screen.getByText('Review target')).toBeInTheDocument()
  })

  it('opens the run dialog for non-HITL rows', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByText('MR-2025-1041'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('LangGraph trace')).toBeInTheDocument()
  })
})
