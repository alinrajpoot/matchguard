import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import AuditPage from './AuditPage'
import { resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter><AuditPage /></MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('audit log', () => {
  it('filters by actor and opens evidence JSON', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('Escalated MR-2025-1042: variance 5.1%')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/filter by actor/i), 'You')
    expect(screen.queryByText('Escalated MR-2025-1042: variance 5.1%')).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /view/i })[0])
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/unit_price_variance_exceeds_threshold|Published policy/)).toBeInTheDocument()
  })
})
