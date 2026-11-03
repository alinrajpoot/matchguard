import type { PolicyDraft } from '@/schemas/domain'
import type {
  ActivityItem, AuditEvent, DashboardData, DemoUser, Document, InfraService,
  Invoice, LineItem, NotificationItem, Policy, QueueItem, Run, Vendor,
} from '@/schemas/domain'
import {
  seedActivity, seedAudit, seedDashboard, seedDocuments, seedInfra,
  seedInvoices, seedLines, seedNotifications, seedPolicies, seedQueue,
  seedRuns, seedUser, seedVendors,
} from './seed'

export function countEnabled(draft: PolicyDraft): number {
  return Object.values(draft.guardrails).filter((g) => g.on).length
}

function createPolicies(): Policy {
  const policies = structuredClone(seedPolicies)
  policies.snapshot = structuredClone(policies.draft)
  policies.baseEnabled = countEnabled(policies.draft)
  policies.dirty = false
  return policies
}

export interface MockDb {
  user: DemoUser
  documents: Document[]
  invoices: Invoice[]
  runs: Run[]
  queue: QueueItem[]
  vendors: Vendor[]
  activity: ActivityItem[]
  notifications: NotificationItem[]
  audit: AuditEvent[]
  policies: Policy
  lines: LineItem[]
  dashboard: DashboardData
  infra: Record<string, InfraService>
  runSeq: number
  auditSeq: number
  generation: number
}

function createDb(): MockDb {
  return {
    user: structuredClone(seedUser),
    documents: structuredClone(seedDocuments),
    invoices: structuredClone(seedInvoices),
    runs: structuredClone(seedRuns),
    queue: structuredClone(seedQueue),
    vendors: structuredClone(seedVendors),
    activity: structuredClone(seedActivity),
    notifications: structuredClone(seedNotifications),
    audit: structuredClone(seedAudit),
    policies: createPolicies(),
    lines: structuredClone(seedLines),
    dashboard: structuredClone(seedDashboard),
    infra: structuredClone(seedInfra),
    runSeq: 0,
    auditSeq: 10,
    generation: 0,
  }
}

export const db: MockDb = createDb()

export function resetDb(): void {
  const generation = db.generation + 1
  Object.assign(db, createDb())
  db.generation = generation
}

export function nextAuditId(): string {
  db.auditSeq += 1
  return `AUD-${String(db.auditSeq).padStart(3, '0')}`
}

export class MockApiError extends Error {}
