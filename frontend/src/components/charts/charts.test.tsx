import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sparkline } from './Sparkline'
import { OutcomeBars } from './OutcomeBars'
import { StraightThroughChart } from './StraightThroughChart'
import { DonutChart } from './DonutChart'

describe('charts', () => {
  it('renders a sparkline path', () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 2]} color="var(--chart-acc)" />)
    expect(container.querySelector('polyline')).toBeInTheDocument()
  })

  it('renders 30 outcome columns with a legend', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({ d: `Mar ${i + 1}`, a: 30, h: 4, r: 1 }))
    const { container } = render(<OutcomeBars data={data} />)
    expect(container.querySelectorAll('[data-bar-col]')).toHaveLength(30)
    expect(screen.getByText('Auto-approved')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders the straight-through chart with an accessible label', () => {
    render(<StraightThroughChart values={[84, 85, 86.2]} />)
    expect(screen.getByRole('img', { name: /straight-through rate/i })).toBeInTheDocument()
  })

  it('renders donut legend values', () => {
    render(<DonutChart parts={[{ label: 'Indexed', value: 1842, color: '#10b981' }]} total={1865} />)
    expect(screen.getByText('Indexed')).toBeInTheDocument()
    expect(screen.getByText('1,842')).toBeInTheDocument()
  })
})
