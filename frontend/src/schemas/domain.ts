import { z } from 'zod'

export const DocTypeSchema = z.enum(['PO', 'GRN', 'INV', 'Unknown'])
export const DocStatusSchema = z.enum([
  'Indexed', 'Processing', 'Needs review', 'Failed',
  'Uploading', 'IDP extraction', 'Indexing',
])
export const DocumentSchema = z.object({
  id: z.string(),
  file: z.string(),
  type: DocTypeSchema,
  vendor: z.string(),
  docNo: z.string().nullable(),
  po: z.string().nullable(),
  grn: z.string().nullable(),
  matchId: z.string().nullable(),
  uploaded: z.string(),
  status: DocStatusSchema,
  confidence: z.number().min(0).max(1),
  pinecone: z.number().int().nonnegative(),
  orphan: z.boolean(),
  reason: z.string().nullable(),
})
export type Document = z.infer<typeof DocumentSchema>
export type DocType = z.infer<typeof DocTypeSchema>

export const InvoiceStatusSchema = z.enum([
  'ready', 'missing_grn', 'missing_po', 'processing',
])
export const InvoiceSchema = z.object({
  id: z.string(),
  no: z.string(),
  vendor: z.string(),
  date: z.string(),
  due: z.string(),
  amount: z.number(),
  po: z.string().nullable(),
  grn: z.string().nullable(),
  status: InvoiceStatusSchema,
  variance: z.number(),
  confidence: z.number(),
  hidden: z.boolean(),
  matchId: z.string().nullable(),
})
export type Invoice = z.infer<typeof InvoiceSchema>
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>

export const RunStatusSchema = z.enum(['auto', 'hitl', 'rej', 'processing'])
export const RunSchema = z.object({
  id: z.string(),
  invoice: z.string(),
  po: z.string(),
  grn: z.string(),
  vendor: z.string(),
  amount: z.number(),
  variance: z.number(),
  confidence: z.number(),
  status: RunStatusSchema,
  duration: z.string(),
  age: z.string(),
})
export type Run = z.infer<typeof RunSchema>
export type RunStatus = z.infer<typeof RunStatusSchema>

export const RiskSchema = z.enum(['High', 'Medium', 'Low'])
export const QueueItemSchema = z.object({
  id: z.string(),
  invoice: z.string(),
  vendor: z.string(),
  amount: z.number(),
  variance: z.number(),
  risk: RiskSchema,
  waiting: z.string(),
  sla: z.string(),
})
export type QueueItem = z.infer<typeof QueueItemSchema>

export const VendorSchema = z.object({
  name: z.string(),
  matches: z.number(),
  variance: z.number(),
  exposure: z.number(),
  risk: RiskSchema,
})
export type Vendor = z.infer<typeof VendorSchema>

export const ActivityItemSchema = z.object({
  tone: z.enum(['ok', 'warn', 'bad', 'info', 'acc', 'neutral']),
  text: z.string(),
  time: z.string(),
})
export type ActivityItem = z.infer<typeof ActivityItemSchema>

export const NotificationTargetSchema = z.enum([
  'dashboard', 'documents', 'invoices', 'runs', 'queue',
  'policies', 'audit', 'notifications', 'settings', 'review',
])
export const NotificationItemSchema = z.object({
  id: z.string(),
  icon: z.string(),
  tone: z.enum(['ok', 'warn', 'bad', 'info', 'acc']),
  title: z.string(),
  body: z.string(),
  time: z.string(),
  unread: z.boolean(),
  target: NotificationTargetSchema,
  match: z.string().optional(),
})
export type NotificationItem = z.infer<typeof NotificationItemSchema>

export const AuditEventSchema = z.object({
  id: z.string(),
  ts: z.string(),
  actor: z.string(),
  action: z.string(),
  object: z.string(),
  evidence: z.record(z.string(), z.unknown()),
})
export type AuditEvent = z.infer<typeof AuditEventSchema>

export const GuardrailSchema = z.object({
  on: z.boolean(),
  param: z.number().nullable(),
  suffix: z.string().optional(),
  step: z.string().optional(),
  control: z.enum(['range']).optional(),
  severity: z.enum(['Block', 'Warn', 'Redact', 'Automation']),
  triggers: z.number(),
  name: z.string(),
  desc: z.string(),
  paramLabel: z.string().optional(),
})
export type Guardrail = z.infer<typeof GuardrailSchema>

export const PolicyDraftSchema = z.object({
  priceTolerance: z.number().min(1).max(10),
  quantityTolerance: z.number(),
  extractionConfidence: z.number(),
  matchConfidence: z.number(),
  hitlAmount: z.number(),
  autoReleaseCap: z.number(),
  hitlSla: z.number(),
  duplicateLookback: z.number(),
  guardrails: z.record(z.string(), GuardrailSchema),
})
export type PolicyDraft = z.infer<typeof PolicyDraftSchema>

export const PolicySchema = z.object({
  version: z.number().int(),
  published: z.string(),
  dirty: z.boolean(),
  baseEnabled: z.number().int(),
  draft: PolicyDraftSchema,
  snapshot: PolicyDraftSchema.nullable(),
  history: z.array(z.object({
    v: z.number(), note: z.string(), date: z.string(),
  })),
})
export type Policy = z.infer<typeof PolicySchema>

export const LineItemSchema = z.object({
  sku: z.string(),
  desc: z.string(),
  poQty: z.number(),
  poPrice: z.number(),
  grnQty: z.number(),
  invQty: z.number(),
  invPrice: z.number(),
  conf: z.number(),
  flag: z.boolean(),
})
export type LineItem = z.infer<typeof LineItemSchema>

export const DashboardDataSchema = z.object({
  kpis: z.array(z.object({
    label: z.string(), value: z.string(), delta: z.string(),
    note: z.string(), neg: z.boolean().optional(), spark: z.array(z.number()),
  })),
  outcomes: z.array(z.object({
    d: z.string(), a: z.number(), h: z.number(), r: z.number(),
  })),
  str: z.array(z.number()),
  guardrailFailures: z.array(z.object({ name: z.string(), value: z.number() })),
  pipeline: z.array(z.object({
    label: z.string(), value: z.number(), color: z.string(),
  })),
  slaAging: z.array(z.object({
    label: z.string(), count: z.number(),
    tone: z.enum(['bad', 'warn', 'info', 'neutral']),
  })),
  vendors: z.array(VendorSchema),
  queue: z.array(QueueItemSchema),
  activity: z.array(ActivityItemSchema),
  infraHealth: z.array(z.object({
    key: z.string(), name: z.string(), res: z.string(), icon: z.string(),
  })),
})
export type DashboardData = z.infer<typeof DashboardDataSchema>

export const ReviewGuardrailSchema = z.object({
  name: z.string(),
  observed: z.string(),
  threshold: z.string(),
  result: z.enum(['pass', 'fail']),
})
export const ReviewBundleSchema = z.object({
  id: z.string(),
  invoice: z.string(),
  po: z.string().nullable(),
  grn: z.string().nullable(),
  vendor: z.string(),
  amount: z.number(),
  variance: z.number(),
  confidence: z.number(),
  lines: z.array(LineItemSchema),
  guardrails: z.array(ReviewGuardrailSchema),
  recommendation: z.string(),
  overbilling: z.number(),
  audit: z.array(z.object({ time: z.string(), text: z.string() })),
  threshold: z.number(),
  policyVersion: z.number(),
  payload: z.record(z.string(), z.unknown()),
})
export type ReviewBundle = z.infer<typeof ReviewBundleSchema>

export const RunDetailSchema = z.object({
  run: RunSchema,
  guardrails: z.array(z.object({
    name: z.string(),
    result: z.enum(['Pass', 'Fail']),
    meta: z.string(),
  })),
  trace: z.array(z.object({
    name: z.string(), meta: z.string(), ms: z.number(),
  })),
})
export type RunDetail = z.infer<typeof RunDetailSchema>

export const InfraServiceSchema = z.object({
  name: z.string(),
  chip: z.string(),
  icon: z.string(),
  res: z.string(),
  region: z.string(),
  req: z.string(),
  url: z.string(),
  note: z.string(),
})
export type InfraService = z.infer<typeof InfraServiceSchema>

export const SearchIndexItemSchema = z.object({
  type: z.enum(['Page', 'Invoice', 'Document']),
  id: z.string(),
  label: z.string(),
  sub: z.string(),
  icon: z.string(),
})
export const SearchIndexSchema = z.object({
  items: z.array(SearchIndexItemSchema),
})
export type SearchIndexItem = z.infer<typeof SearchIndexItemSchema>
export type SearchIndex = z.infer<typeof SearchIndexSchema>

export const AssistantToolSchema = z.object({
  name: z.string(),
  desc: z.string(),
  prompt: z.string(),
})
export type AssistantTool = z.infer<typeof AssistantToolSchema>

export const PreferencesSchema = z.object({
  escalation: z.boolean(),
  slaWarning: z.boolean(),
  weeklyDigest: z.boolean(),
})
export type Preferences = z.infer<typeof PreferencesSchema>

export const DemoUserSchema = z.object({
  name: z.string(),
  initials: z.string(),
  email: z.string(),
  tz: z.string(),
  preferences: PreferencesSchema,
})
export type DemoUser = z.infer<typeof DemoUserSchema>

const TraceSchema = z.array(z.object({
  name: z.string(), meta: z.string(), ms: z.number(),
}))

export const AssistantWidgetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('queue_summary'), count: z.number(), items: z.array(QueueItemSchema) }),
  z.object({ kind: z.literal('dashboard_stats'), tiles: z.array(z.object({ k: z.string(), v: z.string() })) }),
  z.object({ kind: z.literal('vendors'), vendors: z.array(VendorSchema) }),
  z.object({ kind: z.literal('policy_change'), current: z.number(), proposed: z.number(), projected: z.number() }),
  z.object({ kind: z.literal('report'), filename: z.string(), rows: z.number(), size: z.string() }),
  z.object({ kind: z.literal('search_documents'), query: z.string(), results: z.array(z.object({
    docId: z.string(), file: z.string(), type: z.string(), meta: z.string(), s3: z.string(), chunk: z.string(),
  })) }),
  z.object({ kind: z.literal('document'), doc: DocumentSchema }),
  z.object({ kind: z.literal('invoice_links'), invoice: InvoiceSchema, missing: z.enum(['PO', 'GRN']).nullable(), matched: z.string().nullable() }),
  z.object({ kind: z.literal('match_trace'), matchId: z.string(), reason: z.string(), trace: TraceSchema }),
  z.object({ kind: z.literal('guardrail_results'), policyVersion: z.number(), rows: z.array(z.object({
    name: z.string(), observed: z.string(), threshold: z.string(), result: z.enum(['pass', 'fail']),
  })) }),
  z.object({ kind: z.literal('audit_events'), object: z.string(), events: z.array(AuditEventSchema) }),
  z.object({ kind: z.literal('pipeline_health'), services: z.array(z.object({ name: z.string(), meta: z.string(), key: z.string() })) }),
])
export type AssistantWidget = z.infer<typeof AssistantWidgetSchema>

export const AssistantReplySchema = z.object({
  text: z.string().optional(),
  widget: AssistantWidgetSchema.optional(),
})
export type AssistantReply = z.infer<typeof AssistantReplySchema>
