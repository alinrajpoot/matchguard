import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import DashboardPage from './DashboardPage'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => useAuthStore.getState().signIn('priya.raman@northgate.example'))

describe('dashboard', () => {
  it('renders the KPI tiles and chart cards', async () => {
    renderWithProviders(<DashboardPage />, { route: '/dashboard' })
    expect(await screen.findByText('Matches processed')).toBeInTheDocument()
    expect(screen.getAllByText('Auto-approved').length).toBeGreaterThan(0)
    expect(screen.getByText('Match outcomes')).toBeInTheDocument()
    expect(screen.getByText('Straight-through rate')).toBeInTheDocument()
    expect(screen.getAllByText('Document pipeline').length).toBeGreaterThan(0)
    expect(screen.getByText('Infrastructure health')).toBeInTheDocument()
  })
})
