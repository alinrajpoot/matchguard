import { beforeEach, describe, expect, it } from 'vitest'
import { db, resetDb } from './db'
import {
  fetchAssistantTools, fetchDashboard, fetchDocuments, fetchInvoices,
  fetchQueue, fetchReview, fetchRuns, fetchSearchIndex,
} from './api'

beforeEach(() => resetDb())

describe('mock read API', () => {
  it('returns all documents and visible invoices', async () => {
    expect(await fetchDocuments()).toHaveLength(21)
    expect(await fetchInvoices()).toHaveLength(12)
    expect(await fetchRuns()).toHaveLength(10)
    expect(await fetchQueue()).toHaveLength(5)
    expect(await fetchAssistantTools()).toHaveLength(12)
  })

  it('excludes matched invoices from the invoice list and search index', async () => {
    const invoice = db.invoices[0]
    invoice.hidden = true
    expect(await fetchInvoices()).toHaveLength(11)
    const index = await fetchSearchIndex()
    expect(index.items.some((item) => item.type === 'Invoice' && item.id === invoice.id)).toBe(false)
  })

  it('builds a review bundle for the seeded HITL run', async () => {
    const review = await fetchReview('MR-2025-1042')
    expect(review.invoice).toBe('HS-88421')
    expect(review.variance).toBe(5.1)
    expect(review.lines).toHaveLength(4)
    expect(review.guardrails.find((g) => g.name === 'Price variance')?.result).toBe('fail')
  })

  it('derives live queue and activity snapshots for the dashboard', async () => {
    const dashboard = await fetchDashboard()
    expect(dashboard.queue).toHaveLength(5)
    expect(dashboard.kpis).toHaveLength(6)
    expect(dashboard.outcomes).toHaveLength(30)
  })
})
