import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import PoliciesPage from './PoliciesPage'
import { db, resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider><PoliciesPage /></TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('policies', () => {
  it('marks changes dirty and publishes a new version', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('v13 · Mar 14')).toBeInTheDocument()
    const qty = screen.getByLabelText(/quantity tolerance/i)
    await user.clear(qty)
    await user.type(qty, '2')
    expect(await screen.findByText('Unsaved changes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /publish policy/i }))
    await waitFor(() => expect(screen.getByText(/v14 · Just now/i)).toBeInTheDocument())
    expect(db.policies.draft.quantityTolerance).toBe(2)
    expect(db.audit[0].object).toBe('POL-VAR')
  })

  it('disables a guardrail and greys its parameter', async () => {
    const user = userEvent.setup()
    renderPage()
    const toggle = await screen.findByRole('switch', { name: /enable price variance/i })
    await user.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(screen.getByLabelText('Price variance')).toBeDisabled()
  })
})
