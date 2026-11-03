import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import QueuePage from './QueuePage'
import { resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/queue']}>
          <Routes>
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/review/:matchId" element={<div>Review target</div>} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('review queue', () => {
  it('lists escalated matches and opens review', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('MR-2025-1042')).toBeInTheDocument()
    expect(screen.getByText('Active policy')).toBeInTheDocument()
    const row = screen.getByText('MR-2025-1042').closest('tr')!
    await user.click(row.querySelector('a[href="/review/MR-2025-1042"], button')!)
    expect(await screen.findByText('Review target')).toBeInTheDocument()
  })
})
