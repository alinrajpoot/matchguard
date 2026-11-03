import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import LoginPage from './LoginPage'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signOut()
})

describe('login page', () => {
  it('prefills the demo credentials and signs in', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard target</div>} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>,
    )
    expect(screen.getByLabelText(/work email/i)).toHaveValue('priya.raman@northgate.example')
    expect(screen.getByLabelText(/password/i)).toHaveValue('demopassword')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText('Dashboard target')).toBeInTheDocument()
    expect(useAuthStore.getState().user?.email).toBe('priya.raman@northgate.example')
  })
})
