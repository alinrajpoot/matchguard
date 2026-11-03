import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import InvoicesPage from './InvoicesPage'
import { db, resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/invoices']}>
          <Routes><Route path="/invoices" element={<InvoicesPage />} /></Routes>
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

describe('invoices', () => {
  it('shows stat cards and disables run for missing links', async () => {
    renderPage()
    expect(await screen.findByText('Ready to match')).toBeInTheDocument()
    const missing = await screen.findByText('HS-88433')
    const row = missing.closest('tr')!
    expect(row.querySelector('button[title*="missing"]')).toBeDisabled()
  })

  it('expands the three-way chain', async () => {
    const user = userEvent.setup()
    renderPage()
    const row = (await screen.findByText('HS-88421')).closest('tr')!
    await user.click(row.querySelector('button[aria-label="Toggle document chain"]')!)
    expect(await screen.findByText('Purchase order')).toBeInTheDocument()
    expect(screen.getByText('Goods receipt')).toBeInTheDocument()
  })

  it('runs a ready match and navigates to runs', async () => {
    const user = userEvent.setup()
    renderPage()
    const row = (await screen.findByText('HS-88421')).closest('tr')!
    await user.click(row.querySelector('button[title="Run three-way match"]')!)
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/runs'))
    expect(db.runs[0].id).toBe('MR-2025-1044')
  })
})
