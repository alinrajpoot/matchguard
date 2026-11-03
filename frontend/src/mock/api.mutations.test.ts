import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db, resetDb } from './db'
import {
  decideReview, discardPolicy, loadSampleBatch, markAllNotificationsRead,
  publishPolicy, runMatch, uploadDocuments, updatePolicyDraft,
} from './api'

beforeEach(() => resetDb())

describe('match runs', () => {
  it('hides the invoice, creates a processing run, then escalates high variance', async () => {
    const run = await runMatch('INV-88421')
    expect(run.status).toBe('processing')
    expect(db.invoices.find((i) => i.id === 'INV-88421')?.hidden).toBe(true)
    expect(db.runs[0].id).toBe(run.id)
    await vi.waitFor(() => expect(db.runs[0].status).toBe('hitl'), { timeout: 1000 })
    expect(db.queue.some((q) => q.id === run.id)).toBe(true)
    expect(db.audit[0].object).toBe(run.id)
  })

  it('auto-approves a clean invoice', async () => {
    const run = await runMatch('INV-88377')
    await vi.waitFor(() => expect(db.runs[0].status).toBe('auto'), { timeout: 1000 })
    expect(db.queue.some((q) => q.id === run.id)).toBe(false)
  })

  it('rejects running a non-ready invoice', async () => {
    await expect(runMatch('INV-88433')).rejects.toThrow('Cannot run this invoice')
  })
})

describe('uploads', () => {
  it('progresses documents to Indexed and creates invoices', async () => {
    const created = await uploadDocuments([{ name: 'invoice_HS-88440.pdf' }])
    expect(created).toHaveLength(1)
    await vi.waitFor(
      () => expect(db.documents.find((d) => d.id === created[0].id)?.status).toBe('Indexed'),
      { timeout: 1000 },
    )
    expect(db.invoices.some((i) => i.no === 'HS-88440')).toBe(true)
  })

  it('marks an unrecognized file as an orphan', async () => {
    const created = await loadSampleBatch()
    const scan = db.documents.find((d) => d.file === created[4].file)
    await vi.waitFor(() => expect(scan?.status).toBe('Needs review'), { timeout: 1000 })
    expect(scan?.orphan).toBe(true)
  })
})

describe('review decisions', () => {
  it('requires a 10-character reason to approve', async () => {
    await expect(decideReview('MR-2025-1042', 'approve', 'short')).rejects.toThrow(
      'Enter a reason with at least 10 characters to approve.',
    )
  })

  it('removes the queue item and appends an audit event', async () => {
    await decideReview('MR-2025-1042', 'approve', 'Vendor amendment on file for this price increase.')
    expect(db.queue.some((q) => q.id === 'MR-2025-1042')).toBe(false)
    expect(db.audit[0].action).toBe('Approved MR-2025-1042')
    expect(db.audit[0].evidence.decision).toBe('RELEASE')
  })
})

describe('policy', () => {
  it('publishes a draft, increments the version, and records history', async () => {
    const draft = structuredClone(db.policies.draft)
    draft.priceTolerance = 6
    draft.guardrails.priceVariance.param = 6
    const published = await publishPolicy(draft)
    expect(published.version).toBe(14)
    expect(published.draft.priceTolerance).toBe(6)
    expect(published.dirty).toBe(false)
    expect(published.history[0].v).toBe(14)
    expect(db.audit[0].object).toBe('POL-VAR')
  })

  it('discards unsaved guardrail edits back to the published snapshot', async () => {
    const draft = structuredClone(db.policies.draft)
    draft.priceTolerance = 6
    await updatePolicyDraft(draft)
    expect(db.policies.draft.priceTolerance).toBe(6)
    expect(db.policies.dirty).toBe(true)
    const restored = await discardPolicy()
    expect(restored.draft.priceTolerance).toBe(3)
    expect(restored.dirty).toBe(false)
  })
})

describe('notifications', () => {
  it('marks every notification read', async () => {
    await markAllNotificationsRead()
    expect(db.notifications.every((n) => !n.unread)).toBe(true)
  })
})
