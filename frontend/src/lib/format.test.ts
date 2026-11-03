import { describe, expect, it } from 'vitest'
import { initials, money, pct } from './format'

describe('format helpers', () => {
  it('formats money with two decimals and separators', () => {
    expect(money(25055)).toBe('$25,055.00')
    expect(money(470)).toBe('$470.00')
    expect(money(-470)).toBe('-$470.00')
  })

  it('formats percentages to one decimal by default', () => {
    expect(pct(5.1)).toBe('5.1%')
    expect(pct(0)).toBe('0.0%')
  })

  it('derives initials from a name', () => {
    expect(initials('Priya Raman')).toBe('PR')
  })
})
