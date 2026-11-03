import { describe, expect, it } from 'vitest'
import {
  DocumentSchema, InvoiceSchema, RunSchema, QueueItemSchema,
  NotificationItemSchema, AuditEventSchema, PolicySchema, DashboardDataSchema,
} from '@/schemas/domain'
import {
  seedAudit, seedDashboard, seedDocuments, seedInvoices, seedNotifications,
  seedPolicies, seedQueue, seedRuns, seedUser,
} from './seed'
import { DemoUserSchema } from '@/schemas/domain'

describe('demo seed', () => {
  it('matches the mockup counts', () => {
    expect(seedDocuments).toHaveLength(21)
    expect(seedDocuments.filter((d) => d.orphan)).toHaveLength(3)
    expect(seedInvoices).toHaveLength(12)
    expect(seedRuns).toHaveLength(10)
    expect(seedQueue).toHaveLength(5)
    expect(seedNotifications).toHaveLength(6)
    expect(seedAudit).toHaveLength(10)
  })

  it('parses every seeded entity', () => {
    expect(() => DemoUserSchema.parse(seedUser)).not.toThrow()
    seedDocuments.forEach((v) => expect(() => DocumentSchema.parse(v)).not.toThrow())
    seedInvoices.forEach((v) => expect(() => InvoiceSchema.parse(v)).not.toThrow())
    seedRuns.forEach((v) => expect(() => RunSchema.parse(v)).not.toThrow())
    seedQueue.forEach((v) => expect(() => QueueItemSchema.parse(v)).not.toThrow())
    seedNotifications.forEach((v) => expect(() => NotificationItemSchema.parse(v)).not.toThrow())
    seedAudit.forEach((v) => expect(() => AuditEventSchema.parse(v)).not.toThrow())
    expect(() => PolicySchema.parse(seedPolicies)).not.toThrow()
    expect(() => DashboardDataSchema.parse(seedDashboard)).not.toThrow()
  })

  it('has the policy shape from the mockup', () => {
    expect(seedPolicies.version).toBe(13)
    expect(Object.keys(seedPolicies.draft.guardrails)).toHaveLength(18)
    expect(seedPolicies.draft.priceTolerance).toBe(3.0)
  })
})
