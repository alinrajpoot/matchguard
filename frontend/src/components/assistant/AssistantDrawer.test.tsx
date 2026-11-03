import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AssistantDrawer } from './AssistantDrawer'
import { useUiStore } from '@/stores/ui-store'
import { useAssistantStore } from '@/stores/assistant-store'
import { resetDb } from '@/mock/db'
import { useAuthStore } from '@/stores/auth-store'
import { db } from '@/mock/db'

function renderDrawer() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter><AssistantDrawer /></MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
  useAssistantStore.getState().reset()
  useUiStore.setState({ assistantOpen: true, toolsOpen: false })
})

describe('assistant drawer', () => {
  it('shows the welcome message and tool chip after a prompt', async () => {
    const user = userEvent.setup()
    renderDrawer()
    expect(await screen.findByText(/I can search documents/i)).toBeInTheDocument()
    const input = screen.getByLabelText(/message the assistant/i)
    await user.type(input, 'Show pipeline health{enter}')
    await waitFor(() => expect(screen.getByText('get_pipeline_health')).toBeInTheDocument())
    expect(screen.getByText('All demo services are healthy.')).toBeInTheDocument()
  })

  it('approves a policy change into the draft', async () => {
    const user = userEvent.setup()
    renderDrawer()
    const input = screen.getByLabelText(/message the assistant/i)
    await user.type(input, 'Raise variance threshold to 4%{enter}')
    await user.click(await screen.findByRole('button', { name: /approve change/i }))
    await waitFor(() => expect(db.policies.draft.priceTolerance).toBe(4))
    expect(db.policies.dirty).toBe(true)
  })
})
