import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import DocumentsPage from './DocumentsPage'
import { useAuthStore } from '@/stores/auth-store'
import { resetDb } from '@/mock/db'

function renderPage(route = '/documents') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes><Route path="/documents" element={<DocumentsPage />} /></Routes>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetDb()
  useAuthStore.getState().signIn('priya.raman@northgate.example')
})

describe('documents', () => {
  it('lists repository documents and opens the viewer', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('PO-70418.pdf')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /view po-70418/i })[0])
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /extracted fields/i })).toBeInTheDocument()
  })

  it('filters documents', async () => {
    const user = userEvent.setup()
    renderPage()
    const input = await screen.findByLabelText(/filter documents/i)
    await user.type(input, 'HS-88421')
    expect(await screen.findByText('HS-88421.pdf')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('PO-70418.pdf')).not.toBeInTheDocument())
  })

  it('loads a sample batch', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /load sample batch/i }))
    expect(await screen.findByText('PO-70425.pdf')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('invoice_HS-88440.pdf')).toBeInTheDocument())
  })

  it('deletes an orphan after confirmation', async () => {
    const user = userEvent.setup()
    renderPage('/documents?tab=orphans')
    expect(await screen.findByText('scan_20250316_1142.pdf')).toBeInTheDocument()
    const row = screen.getByText('scan_20250316_1142.pdf').closest('tr')
    await user.click(within(row!).getByRole('button', { name: /delete scan_20250316_1142/i }))
    await user.click(await screen.findByRole('button', { name: /^delete$/i }))
    await waitFor(() => expect(screen.queryByText('scan_20250316_1142.pdf')).not.toBeInTheDocument())
  })
})
