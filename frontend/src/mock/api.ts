import {
  DashboardDataSchema, DemoUserSchema, DocumentSchema, InvoiceSchema,
  PolicyDraftSchema, PolicySchema, QueueItemSchema, ReviewBundleSchema,
  RunDetailSchema, RunSchema, AuditEventSchema, NotificationItemSchema,
  InfraServiceSchema, AssistantToolSchema, SearchIndexSchema,
} from '@/schemas/domain'
import type {
  AuditEvent, DashboardData, DemoUser, Document, DocType, InfraService,
  Invoice, NotificationItem, Policy, PolicyDraft, Preferences, QueueItem,
  ReviewBundle, Run, RunDetail,
} from '@/schemas/domain'
import { MockApiError, countEnabled, db, nextAuditId, resetDb } from './db'
import { RUN_RESOLVE_MS, STAGE_MS, sleep } from './delay'
import { initials, money, nowUTC } from '@/lib/format'
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

function docNoFromName(name: string) {
  return name.replace(/\.[^.]+$/, '')
    .replace(/^(purchase order|goods receipt note|invoice)\s*[_\-:]?\s*/i, '')
    .replace(/^(po|grn|inv)[_\s:]\s*/i, '')
    .trim() || name.replace(/\.[^.]+$/, '')
}

function vendorFromName(name: string) {
  const n = name.toLowerCase()
  if (/mfc|meridian/.test(n)) return 'Meridian Fiberform Co., Ltd.'
  if (/hs|hacienda/.test(n)) return 'Hacienda Precision Parts'
  if (/tn|tornillos/.test(n)) return 'Tornillos Norte S.A.'
  if (/ab|aceros/.test(n)) return 'Aceros del Bajío'
  if (/rd|rhein/.test(n)) return 'Rhein Dichtungen GmbH'
  if (/ci|cobre/.test(n)) return 'Cobre Industrial'
  if (/fa|fundici/.test(n)) return 'Fundición Altamira'
  if (/mr|maquinados/.test(n)) return 'Maquinados Reyna'
  return 'Resolved vendor'
}

function linksFromName(name: string) {
  const n = name.toLowerCase()
  if (/mfc|meridian/.test(n)) return { po: 'LPS-2025-0417', grn: 'LPS-2025-0417-A' }
  if (/hs|hacienda/.test(n)) return { po: 'PO-70418', grn: 'GRN-30917' }
  if (/tn|tornillos/.test(n)) return { po: 'PO-70391', grn: 'GRN-30905' }
  if (/ab|aceros/.test(n)) return { po: 'PO-70381', grn: 'GRN-30898' }
  if (/rd|rhein/.test(n)) return { po: 'PO-70388', grn: 'GRN-30901' }
  if (/ci|cobre/.test(n)) return { po: 'PO-70402', grn: 'GRN-30928' }
  if (/fa|fundici/.test(n)) return { po: 'PO-70340', grn: 'GRN-30880' }
  if (/mr|maquinados/.test(n)) return { po: 'PO-70377', grn: null }
  return { po: null, grn: null }
}

function amountFromName(name: string) {
  const n = name.toLowerCase()
  if (/mfc-25-08813/.test(n)) return 31830.75
  if (/hs-88421/.test(n)) return 25055.0
  if (/hs-88440/.test(n)) return 9870.0
  if (/ci-4477/.test(n)) return 4310.8
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return Math.round((3000 + (h % 22000)) * 100) / 100
}

function varianceFromName(name: string) {
  const n = name.toLowerCase()
  if (/hs-88421/.test(n)) return 5.1
  if (/fa-1182/.test(n)) return 3.3
  return 0.0
}

function invoiceDatesFromName(name: string) {
  if (/mfc-25-08813/.test(name.toLowerCase())) return { date: '2025-10-06', due: '2025-11-20' }
  return { date: '2025-03-18', due: '2025-04-17' }
}

export async function uploadDocuments(files: { name: string }[]): Promise<Document[]> {
  await sleep()
  const created = files.map((file, index) => {
    const lower = file.name.toLowerCase()
    const type: DocType =
      lower.startsWith('po') || lower.includes('purchase') ? 'PO'
        : lower.startsWith('grn') || lower.includes('receipt') ? 'GRN'
          : lower.startsWith('inv') || lower.includes('invoice') ? 'INV'
            : 'Unknown'
    const doc: Document = {
      id: `DOC-${1200 + db.documents.length + index}`,
      file: file.name,
      type,
      vendor: 'Resolving…',
      docNo: null,
      po: null,
      grn: null,
      matchId: null,
      uploaded: 'Just now',
      status: 'Uploading',
      confidence: 0,
      pinecone: 0,
      orphan: false,
      reason: null,
    }
    db.documents.unshift(doc)
    scheduleDocumentStages(doc, index)
    return doc
  })
  return created
}

function scheduleDocumentStages(doc: Document, index: number) {
  const generation = db.generation
  const stages: Document['status'][] = ['IDP extraction', 'Indexing', 'Indexed']
  stages.forEach((stage, stageIndex) => {
    setTimeout(() => {
      if (db.generation !== generation) return
      doc.status = stage
      if (stage === 'Indexed') finalizeDocument(doc, index)
    }, STAGE_MS * (stageIndex + 1))
  })
}

function finalizeDocument(doc: Document, index: number) {
  if (doc.type === 'Unknown') {
    doc.vendor = 'Unresolved'
    doc.confidence = 0.38
    doc.status = 'Needs review'
    doc.orphan = true
    doc.reason = 'Unrecognized vendor · low confidence'
    doc.pinecone = 0
    return
  }
  const docNo = docNoFromName(doc.file)
  const vendor = vendorFromName(doc.file)
  const links = linksFromName(doc.file)
  doc.docNo = docNo
  doc.vendor = vendor
  doc.confidence = 0.96
  doc.pinecone = 6 + (index % 4)
  if (doc.type === 'PO') doc.po = docNo
  if (doc.type === 'GRN') doc.grn = docNo
  if (doc.type === 'INV') {
    doc.po = links.po
    doc.grn = links.grn
    if (!db.invoices.some((invoice) => invoice.no === docNo)) {
      const dates = invoiceDatesFromName(doc.file)
      const status = links.po && links.grn ? 'ready' : links.po ? 'missing_grn' : 'missing_po'
      const invoice = InvoiceSchema.parse({
        id: docNo.startsWith('INV-') ? docNo : `INV-${docNo}`,
        no: docNo,
        vendor,
        date: dates.date,
        due: dates.due,
        amount: amountFromName(doc.file),
        po: links.po,
        grn: links.grn,
        status,
        variance: varianceFromName(doc.file),
        confidence: 96,
        hidden: false,
        matchId: null,
      })
      db.invoices.unshift(invoice)
    }
  }
}

export async function loadSampleBatch(): Promise<Document[]> {
  return uploadDocuments([
    { name: 'PO-70425.pdf' },
    { name: 'GRN-30940.pdf' },
    { name: 'invoice_HS-88440.pdf' },
    { name: 'invoice_CI-4477.pdf' },
    { name: 'scan_20250316_1301.pdf' },
  ])
}

export async function deleteDocuments(ids: string[]): Promise<void> {
  await sleep()
  db.documents = db.documents.filter((doc) => !ids.includes(doc.id))
}

export async function runMatch(invoiceId: string): Promise<Run> {
  await sleep()
  const invoice = db.invoices.find((item) => item.id === invoiceId)
  if (!invoice || invoice.hidden || invoice.status !== 'ready') {
    throw new MockApiError('Cannot run this invoice')
  }
  const id = `MR-2025-${1044 + db.runSeq}`
  db.runSeq += 1
  invoice.hidden = true
  invoice.matchId = id
  const run = RunSchema.parse({
    id,
    invoice: invoice.no,
    po: invoice.po,
    grn: invoice.grn,
    vendor: invoice.vendor,
    amount: invoice.amount,
    variance: invoice.variance,
    confidence: invoice.confidence,
    status: 'processing',
    duration: '—',
    age: 'now',
  })
  db.runs.unshift(run)
  scheduleRunResolution(run, invoice)
  return run
}

function scheduleRunResolution(run: Run, invoice: Invoice) {
  const generation = db.generation
  setTimeout(() => {
    if (db.generation !== generation) return
    const target = db.runs.find((item) => item.id === run.id)
    if (!target) return
    target.status = invoice.variance > 3.0 ? 'hitl' : 'auto'
    target.duration = '1m 04s'
    if (target.status === 'hitl') {
      db.queue.unshift({
        id: target.id, invoice: invoice.no, vendor: invoice.vendor,
        amount: invoice.amount, variance: invoice.variance,
        risk: invoice.variance > 6 ? 'High' : 'Medium',
        waiting: '0m', sla: '8h 00m',
      })
      db.audit.unshift({
        id: nextAuditId(), ts: nowUTC(), actor: 'MatchGuard System',
        action: `Escalated ${target.id}: variance ${invoice.variance.toFixed(1)}%`,
        object: target.id,
        evidence: {
          match_id: target.id, decision: 'HOLD',
          variance_pct: invoice.variance, threshold_pct: 3.0,
          confidence: invoice.confidence / 100,
        },
      })
      db.activity.unshift({ tone: 'warn', text: `Guardrail triggered on ${target.id}: unit price variance`, time: 'just now' })
    } else {
      db.audit.unshift({
        id: nextAuditId(), ts: nowUTC(), actor: 'MatchGuard System',
        action: `Auto-approved invoice ${invoice.no}`,
        object: target.id,
        evidence: {
          match_id: target.id, decision: 'AUTO_APPROVE',
          variance_pct: invoice.variance, confidence: invoice.confidence / 100,
        },
      })
      db.activity.unshift({ tone: 'ok', text: `Invoice ${invoice.no} approved automatically`, time: 'just now' })
    }
  }, RUN_RESOLVE_MS)
}

export async function decideReview(
  matchId: string,
  decision: 'approve' | 'reject',
  reason: string,
): Promise<void> {
  await sleep()
  if (decision === 'approve' && reason.trim().length < 10) {
    throw new MockApiError('Enter a reason with at least 10 characters to approve.')
  }
  db.queue = db.queue.filter((item) => item.id !== matchId)
  db.audit.unshift({
    id: nextAuditId(),
    ts: nowUTC(),
    actor: 'You',
    action: `${decision === 'approve' ? 'Approved' : 'Rejected'} ${matchId}`,
    object: matchId,
    evidence: {
      match_id: matchId,
      decision: decision === 'approve' ? 'RELEASE' : 'REJECT',
      reason,
    },
  })
}

export async function updatePolicyDraft(draft: PolicyDraft): Promise<Policy> {
  await sleep()
  db.policies.draft = PolicyDraftSchema.parse(draft)
  db.policies.dirty = true
  return PolicySchema.parse(db.policies)
}

export async function publishPolicy(draft: PolicyDraft): Promise<Policy> {
  await sleep()
  const parsed = PolicyDraftSchema.parse(draft)
  db.policies.draft = parsed
  db.policies.version += 1
  db.policies.published = 'Just now'
  db.policies.snapshot = structuredClone(parsed)
  db.policies.baseEnabled = countEnabled(parsed)
  db.policies.dirty = false
  db.policies.history.unshift({
    v: db.policies.version,
    note: `Threshold ${parsed.priceTolerance.toFixed(1)}%`,
    date: 'Just now',
  })
  db.audit.unshift({
    id: nextAuditId(),
    ts: nowUTC(),
    actor: 'You',
    action: `Published policy v${db.policies.version}`,
    object: 'POL-VAR',
    evidence: {
      policy_version: db.policies.version,
      price_variance_pct: parsed.priceTolerance,
      enabled_guardrails: countEnabled(parsed),
    },
  })
  return PolicySchema.parse(db.policies)
}

export async function discardPolicy(): Promise<Policy> {
  await sleep()
  if (db.policies.snapshot) db.policies.draft = structuredClone(db.policies.snapshot)
  db.policies.dirty = false
  return PolicySchema.parse(db.policies)
}

export async function markNotificationRead(id: string): Promise<void> {
  await sleep()
  const notification = db.notifications.find((item) => item.id === id)
  if (notification) notification.unread = false
}

export async function markAllNotificationsRead(): Promise<void> {
  await sleep()
  db.notifications.forEach((item) => { item.unread = false })
}

export async function updateProfile(input: { name: string; email: string; tz: string }): Promise<DemoUser> {
  await sleep()
  db.user = { ...db.user, ...input, initials: initials(input.name) }
  return DemoUserSchema.parse(db.user)
}

export async function updatePreferences(input: Preferences): Promise<DemoUser> {
  await sleep()
  db.user.preferences = { ...input }
  return DemoUserSchema.parse(db.user)
}

export async function resetDemo(): Promise<void> {
  await sleep()
  resetDb()
}
