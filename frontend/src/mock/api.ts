import {
  DashboardDataSchema, DemoUserSchema, DocumentSchema, InvoiceSchema,
  PolicySchema, QueueItemSchema, ReviewBundleSchema, RunDetailSchema,
  RunSchema, AuditEventSchema, NotificationItemSchema, InfraServiceSchema,
  AssistantToolSchema, SearchIndexSchema,
} from '@/schemas/domain'
import type {
  AuditEvent, DashboardData, DemoUser, Document, InfraService, Invoice,
  NotificationItem, Policy, QueueItem, ReviewBundle, Run, RunDetail,
} from '@/schemas/domain'
import { db } from './db'
import { sleep } from './delay'
import { money } from '@/lib/format'
import { seedAssistantTools, seedNav } from './seed'

export async function fetchMe(): Promise<DemoUser> {
  await sleep()
  return DemoUserSchema.parse(db.user)
}

export async function fetchDashboard(): Promise<DashboardData> {
  await sleep()
  return DashboardDataSchema.parse({
    ...db.dashboard,
    queue: db.queue.slice(0, 5),
    activity: db.activity.slice(0, 6),
  })
}

export async function fetchDocuments(): Promise<Document[]> {
  await sleep()
  return DocumentSchema.array().parse(db.documents)
}

export async function fetchInvoices(): Promise<Invoice[]> {
  await sleep()
  return InvoiceSchema.array().parse(db.invoices.filter((i) => !i.hidden))
}

export async function fetchRuns(): Promise<Run[]> {
  await sleep()
  return RunSchema.array().parse(db.runs)
}

export async function fetchRun(id: string): Promise<RunDetail> {
  await sleep()
  const run = db.runs.find((r) => r.id === id)
  if (!run) throw new Error(`Run ${id} not found`)
  return RunDetailSchema.parse({
    run,
    guardrails: [
      { name: 'Price variance', result: run.variance > 3 ? 'Fail' : 'Pass', meta: `${run.variance.toFixed(1)}% vs 3.0%` },
      { name: 'Quantity match', result: 'Pass', meta: '0 units variance' },
      { name: 'Tax compliance', result: 'Pass', meta: '16.0% IVA' },
      { name: 'Evidence grounding', result: 'Pass', meta: '4/4 lines cited' },
    ],
    trace: [
      { name: 'retrieve', meta: 'Pinecone top-k 8', ms: 312 },
      { name: 'compare', meta: 'Nova Lite line diff', ms: 1200 },
      { name: 'guardrail', meta: 'Policy v13', ms: 420 },
      { name: 'decide', meta: 'HITL threshold', ms: 980 },
    ],
  })
}

export async function fetchQueue(): Promise<QueueItem[]> {
  await sleep()
  return QueueItemSchema.array().parse(db.queue)
}

export async function fetchReview(id: string): Promise<ReviewBundle> {
  await sleep()
  const run = db.runs.find((r) => r.id === id)
  const invoice = run?.invoice ?? 'HS-88421'
  const po = run?.po ?? 'PO-70418'
  const grn = run?.grn ?? 'GRN-30917'
  const vendor = run?.vendor ?? 'Hacienda Precision Parts'
  const amount = run?.amount ?? 25055
  const variance = run?.variance ?? 5.1
  const confidence = run?.confidence ?? 91
  const threshold = db.policies.draft.priceTolerance
  const flagged = db.lines.find((l) => l.flag) ?? db.lines[0]
  return ReviewBundleSchema.parse({
    id,
    invoice,
    po,
    grn,
    vendor,
    amount,
    variance,
    confidence,
    lines: db.lines,
    guardrails: [
      { name: 'Price variance', observed: `${variance.toFixed(1)}%`, threshold: `${threshold.toFixed(1)}%`, result: variance > threshold ? 'fail' : 'pass' },
      { name: 'Quantity', observed: '0 units', threshold: '0 units', result: 'pass' },
      { name: 'Tax (IVA 16%)', observed: '16.0%', threshold: '16.0%', result: 'pass' },
      { name: 'Evidence grounding', observed: '4/4 cited', threshold: '≥1/line', result: 'pass' },
    ],
    recommendation: `Unit price on ${flagged.sku} is ${money(flagged.invPrice)} vs ${money(flagged.poPrice)} on the PO. Quantity received matches the invoice on all 4 lines. Net overbilling if paid: ${money(470)}.`,
    overbilling: 470,
    audit: [
      { time: '09:12', text: 'PO uploaded' },
      { time: '09:14', text: 'GRN indexed' },
      { time: '09:20', text: 'Match initiated' },
      { time: '09:21', text: 'Escalated: variance threshold' },
    ],
    threshold,
    policyVersion: db.policies.version,
    payload: {
      match_id: id,
      decision: 'HOLD',
      reason: 'unit_price_variance_exceeds_threshold',
      line: flagged.sku,
      variance_pct: Number(variance.toFixed(1)),
      threshold_pct: threshold,
      guardrails: { variance: 'fail', quantity: 'pass', tax: 'pass', grounding: 'pass' },
      confidence: confidence / 100,
    },
  })
}

export async function fetchPolicy(): Promise<Policy> {
  await sleep()
  return PolicySchema.parse(db.policies)
}

export async function fetchAudit(): Promise<AuditEvent[]> {
  await sleep()
  return AuditEventSchema.array().parse(db.audit)
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await sleep()
  return NotificationItemSchema.array().parse(db.notifications)
}

export async function fetchInfra(): Promise<Record<string, InfraService>> {
  await sleep()
  return Object.fromEntries(
    Object.entries(db.infra).map(([key, value]) => [key, InfraServiceSchema.parse(value)]),
  )
}

export async function fetchAssistantTools() {
  await sleep()
  return AssistantToolSchema.array().parse(seedAssistantTools)
}

export async function fetchSearchIndex() {
  await sleep()
  const items = [
    ...seedNav.map((nav) => ({
      type: 'Page' as const, id: nav.id, label: nav.label, sub: nav.group, icon: 'layout-dashboard',
    })),
    ...db.invoices.filter((i) => !i.hidden).map((i) => ({
      type: 'Invoice' as const, id: i.id, label: i.no,
      sub: `${i.vendor} · ${money(i.amount)} · ${i.status.replace('_', ' ')}`,
      icon: 'receipt-text',
    })),
    ...db.documents.map((d) => ({
      type: 'Document' as const, id: d.id, label: d.file,
      sub: `${d.type === 'INV' ? 'Invoice' : d.type} · ${d.vendor} · ${d.status}`,
      icon: 'file-text',
    })),
  ]
  return SearchIndexSchema.parse({ items })
}
