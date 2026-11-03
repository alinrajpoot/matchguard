import { useState, type ReactNode } from 'react'
import { Download, ExternalLink, Eye, FileSpreadsheet, Play, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DocumentSpine } from '@/components/shared/DocumentSpine'
import { InfraChip } from '@/components/shared/InfraChip'
import { KeyValueList } from '@/components/shared/KeyValueList'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { useRunMatch, useUpdatePolicyDraft } from '@/hooks/mutations'
import { usePolicy } from '@/hooks/queries'
import { money } from '@/lib/format'
import { s3Key } from '@/lib/s3'
import { db } from '@/mock/db'
import type { AssistantWidget as AssistantWidgetData } from '@/schemas/domain'
import { useUiStore } from '@/stores/ui-store'

const WIDGET_META: Record<string, { tool: string; ms: number; service: string }> = {
  queue_summary: { tool: 'get_queue_summary', ms: 312, service: 'PostgreSQL' },
  dashboard_stats: { tool: 'get_dashboard_stats', ms: 418, service: 'PostgreSQL' },
  vendors: { tool: 'list_vendors', ms: 286, service: 'Pinecone + PostgreSQL' },
  policy_change: { tool: 'propose_policy_change', ms: 204, service: 'FastAPI + PostgreSQL' },
  report: { tool: 'run_report', ms: 932, service: 'PostgreSQL + S3' },
  search_documents: { tool: 'search_documents', ms: 188, service: 'Pinecone + Bedrock' },
  document: { tool: 'get_document', ms: 142, service: 'S3 + Bedrock' },
  invoice_links: { tool: 'get_invoice_links', ms: 96, service: 'PostgreSQL + S3' },
  match_trace: { tool: 'get_match_trace', ms: 2914, service: 'LangGraph + GlassFlow' },
  guardrail_results: { tool: 'get_guardrail_results', ms: 141, service: 'FastAPI policy engine' },
  audit_events: { tool: 'get_audit_events', ms: 88, service: 'PostgreSQL audit_log' },
  pipeline_health: { tool: 'get_pipeline_health', ms: 64, service: 'Multi-service' },
}

const P = 'mb-[6px] text-muted-foreground last:mb-0'

function useWidgetActions() {
  const navigate = useNavigate()
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen)
  const openInfra = useUiStore((state) => state.openInfra)
  return {
    go: (path: string) => {
      setAssistantOpen(false)
      navigate(path)
    },
    openInfra,
  }
}

function Frame({ kind, children }: { kind: string; children: ReactNode }) {
  const meta = WIDGET_META[kind] ?? { tool: kind, ms: 0, service: 'Mock service' }
  return (
    <div className="mt-1.5 overflow-hidden rounded-[7px] border bg-card">
      <div className="flex items-center gap-1.5 border-b bg-[#fafbfc] px-2 py-1.5 font-mono text-[9px] text-muted-foreground">
        <Wrench className="size-3" />
        <span>{meta.tool}</span>
        <span className="ml-auto font-sans text-[8.5px] text-muted-foreground/70">{meta.ms} ms</span>
        <span className="font-sans text-[8.5px] text-muted-foreground/70">{meta.service}</span>
      </div>
      <div className="px-[9px] py-2 text-[10.5px] leading-[1.45]">{children}</div>
    </div>
  )
}

type QueueWidget = Extract<AssistantWidgetData, { kind: 'queue_summary' }>
type DashboardWidget = Extract<AssistantWidgetData, { kind: 'dashboard_stats' }>
type VendorsWidget = Extract<AssistantWidgetData, { kind: 'vendors' }>
type PolicyChange = Extract<AssistantWidgetData, { kind: 'policy_change' }>
type ReportWidget = Extract<AssistantWidgetData, { kind: 'report' }>
type SearchWidget = Extract<AssistantWidgetData, { kind: 'search_documents' }>
type DocumentWidgetData = Extract<AssistantWidgetData, { kind: 'document' }>
type InvoiceLinksWidget = Extract<AssistantWidgetData, { kind: 'invoice_links' }>
type TraceWidget = Extract<AssistantWidgetData, { kind: 'match_trace' }>
type GuardrailWidget = Extract<AssistantWidgetData, { kind: 'guardrail_results' }>
type AuditWidget = Extract<AssistantWidgetData, { kind: 'audit_events' }>
type HealthWidget = Extract<AssistantWidgetData, { kind: 'pipeline_health' }>

function QueueSummaryWidget({ widget }: { widget: QueueWidget }) {
  const { go } = useWidgetActions()
  return (
    <Frame kind="queue_summary">
      <p className={P}>{widget.count} matches need a decision. Closest SLA first.</p>
      {widget.items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
          <div className="min-w-0">
            <b>{item.id}</b>
            <div className="text-[9px] text-muted-foreground">{item.vendor}</div>
          </div>
          <div className="text-right">
            <b className="tabular-nums">{item.variance.toFixed(1)}%</b>
            <div className="text-[9px] text-muted-foreground">{item.sla} left</div>
          </div>
        </div>
      ))}
      <Button className="mt-1.5" size="xs" variant="outline" onClick={() => go('/queue')}>
        Open review queue
      </Button>
    </Frame>
  )
}

function DashboardStatsWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <Frame kind="dashboard_stats">
      <p className={P}>
        Last 30 days. Volume is up 12.4% and straight-through processing is holding at 86.2%.
      </p>
      <div className="grid grid-cols-2 gap-[5px]">
        {widget.tiles.map((tile) => (
          <div key={tile.k} className="rounded-[5px] border px-1.5 py-1">
            <div className="text-[8.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {tile.k}
            </div>
            <b className="mt-px block text-[13px] tracking-[-0.01em]">{tile.v}</b>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function VendorsWidgetView({ widget }: { widget: VendorsWidget }) {
  return (
    <Frame kind="vendors">
      <p className={P}>Highest variance vendors this month.</p>
      {widget.vendors.map((vendor) => (
        <div key={vendor.name} className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
          <div className="min-w-0">
            <b>{vendor.name}</b>
            <div className="text-[9px] text-muted-foreground">
              {vendor.matches} matches · {money(vendor.exposure)} exposure
            </div>
          </div>
          <div className="text-right">
            <b className="tabular-nums">{vendor.variance.toFixed(1)}%</b>
            <div className="mt-0.5"><RiskBadge risk={vendor.risk} /></div>
          </div>
        </div>
      ))}
    </Frame>
  )
}

function PolicyChangeWidget({ widget }: { widget: PolicyChange }) {
  const { data: policy } = usePolicy()
  const updateDraft = useUpdatePolicyDraft()
  const { go } = useWidgetActions()
  const [status, setStatus] = useState<'idle' | 'approved' | 'cancelled'>('idle')
  const projectedDelta = widget.projected === 177
    ? 'no change'
    : `${widget.projected < 177 ? '−' : '+'}${Math.abs(widget.projected - 177)}`

  const approve = () => {
    const draft = policy?.draft ?? db.policies.draft
    updateDraft.mutate({
      ...draft,
      priceTolerance: widget.proposed,
      guardrails: {
        ...draft.guardrails,
        priceVariance: { ...draft.guardrails.priceVariance, param: widget.proposed },
      },
    }, {
      onSuccess: () => setStatus('approved'),
      onError: (error) => toast(error.message),
    })
  }

  if (status === 'approved') {
    return (
      <Frame kind="policy_change">
        <p className={P}>
          <b>Draft updated.</b> Variance threshold is now {widget.proposed.toFixed(1)}%. Publish the
          policy to apply it, or discard from the Policy page.
        </p>
        <Button size="xs" variant="outline" onClick={() => go('/policies')}>Open policy</Button>
      </Frame>
    )
  }

  if (status === 'cancelled') {
    return (
      <Frame kind="policy_change">
        <p className={P}>Cancelled. No changes were made.</p>
      </Frame>
    )
  }

  return (
    <Frame kind="policy_change">
      <p className={P}>I can make that change, but it needs your approval first.</p>
      <div className="my-1.5 rounded-[5px] border border-[#fedf89] bg-[#fffcf5] px-2 py-1.5">
        <div className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Proposed change
        </div>
        <div className="mt-1 flex justify-between gap-2">
          <span>Variance threshold</span>
          <b>{widget.current.toFixed(1)}% → {widget.proposed.toFixed(1)}%</b>
        </div>
        <div className="flex justify-between gap-2">
          <span>Projected HITL</span>
          <b>177 → {widget.projected} ({projectedDelta})</b>
        </div>
        <div className="mt-[3px] text-[9px] text-muted-foreground">
          Amount threshold and other guardrails unchanged.
        </div>
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <Button size="xs" disabled={updateDraft.isPending} onClick={approve}>Approve change</Button>
        <Button size="xs" variant="outline" onClick={() => setStatus('cancelled')}>Cancel</Button>
      </div>
    </Frame>
  )
}

function ReportWidgetView({ widget }: { widget: ReportWidget }) {
  return (
    <Frame kind="report">
      <p className={P}>Vendor variance report for the last 30 days is ready.</p>
      <div className="flex items-center gap-1.5 rounded-md border p-1.5">
        <span className="flex size-[26px] flex-none items-center justify-center rounded-md bg-success-bg text-success">
          <FileSpreadsheet className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold">{widget.filename}</div>
          <div className="text-[9px] text-muted-foreground">{widget.rows} matches · {widget.size}</div>
        </div>
        <Button
          size="xs"
          variant="outline"
          onClick={() => toast(`Download started · ${widget.filename} (demo).`)}
        >
          <Download />Download
        </Button>
      </div>
    </Frame>
  )
}

function SearchDocumentsWidget({ widget }: { widget: SearchWidget }) {
  const { go } = useWidgetActions()
  return (
    <Frame kind="search_documents">
      <p className={P}>
        {widget.results.length} chunks match <b>{widget.query}</b>. Ranked by cosine similarity.
      </p>
      {widget.results.map((result) => (
        <button
          key={result.docId}
          type="button"
          onClick={() => go(`/documents?doc=${result.docId}`)}
          className="block w-full border-b py-1.5 text-left last:border-0 hover:bg-[#fafbfc]"
        >
          <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-semibold">
            <span>{result.file}</span>
            <Badge variant="neutral">{result.type}</Badge>
          </div>
          <div className="mt-0.5 text-[9.5px] text-muted-foreground">
            {result.meta} · {result.chunk}
          </div>
          <div className="mt-0.5 text-[8.5px] text-muted-foreground/70">{result.s3}</div>
        </button>
      ))}
    </Frame>
  )
}

function DocumentWidgetView({ widget }: { widget: DocumentWidgetData }) {
  const { go } = useWidgetActions()
  const doc = widget.doc
  return (
    <Frame kind="document">
      <div className="mb-[7px] rounded-md border bg-white p-2 font-serif text-[9px] text-[#333]">
        <div className="flex justify-between border-b border-[#ddd] py-0.5">
          <b>{doc.vendor}</b>
          <span>{doc.type === 'INV' ? 'INVOICE' : doc.type}</span>
        </div>
        <div className="flex justify-between border-b border-[#ddd] py-0.5">
          <span>{doc.docNo ?? '—'}</span>
          <span>{doc.uploaded}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>{[doc.po, doc.grn].filter(Boolean).join(' · ') || 'Unlinked'}</span>
          <span>{doc.status}</span>
        </div>
      </div>
      <KeyValueList
        items={[
          ['Vendor', doc.vendor],
          ['Document', doc.docNo ?? '—'],
          ['Confidence', `${Math.round(doc.confidence * 100)}%`],
          ['Chunks', `${doc.pinecone} Pinecone vectors`],
        ]}
      />
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <Button size="xs" variant="outline" onClick={() => go(`/documents?doc=${doc.id}`)}>
          <Eye />Open full document
        </Button>
        <InfraChip service="s3" resource={s3Key(doc)} label="S3 object" />
      </div>
    </Frame>
  )
}

function InvoiceLinksWidgetView({ widget }: { widget: InvoiceLinksWidget }) {
  const runMatch = useRunMatch()
  const { go } = useWidgetActions()
  const invoice = widget.invoice

  const run = () => {
    runMatch.mutate(invoice.id, {
      onSuccess: (created) => {
        toast(`Match ${created.id} started · LangGraph retrieve → compare → guardrail → decide`)
        go('/runs')
      },
      onError: (error) => toast(error.message),
    })
  }

  return (
    <Frame kind="invoice_links">
      <DocumentSpine invoice={invoice.no} po={invoice.po} grn={invoice.grn} />
      {widget.missing ? (
        <>
          <div className="mt-1.5"><Badge variant="warning">Missing {widget.missing}</Badge></div>
          <div className="mt-1 text-[9.5px] text-muted-foreground">
            Upload the missing document before running a match.
          </div>
          <Button className="mt-1.5" size="xs" variant="outline" onClick={() => go('/documents')}>
            Open documents
          </Button>
        </>
      ) : widget.matched ? (
        <>
          <p className="mt-1.5 text-muted-foreground">
            Already matched as <b>{widget.matched}</b>.
          </p>
          <Button className="mt-1.5" size="xs" variant="outline" onClick={() => go('/runs')}>
            Open Match Runs
          </Button>
        </>
      ) : (
        <div className="mt-1.5 flex gap-1.5">
          <Button size="xs" disabled={runMatch.isPending} onClick={run}>
            <Play />Run match
          </Button>
          <Button size="xs" variant="outline" onClick={() => go('/invoices')}>Open invoice</Button>
        </div>
      )}
    </Frame>
  )
}

function MatchTraceWidgetView({ widget }: { widget: TraceWidget }) {
  return (
    <Frame kind="match_trace">
      <p className={P}>{widget.reason}</p>
      <ol className="mb-1.5 mt-1 space-y-1.5">
        {widget.trace.map((node, index) => (
          <li key={node.name} className="flex gap-1.5">
            <span className="mt-0.5 flex size-4 flex-none items-center justify-center rounded-full bg-accent text-[8.5px] font-bold text-accent-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <b>{node.name}</b>
              <span className="text-muted-foreground"> · {node.meta}</span>
            </div>
            <span className="text-[9px] text-muted-foreground/70">{node.ms} ms</span>
          </li>
        ))}
      </ol>
      <InfraChip service="glassflow" resource={`trace ${widget.matchId}`} label="Open trace in GlassFlow Rius" />
    </Frame>
  )
}

function GuardrailResultsWidget({ widget }: { widget: GuardrailWidget }) {
  return (
    <Frame kind="guardrail_results">
      <p className={P}>Policy v{widget.policyVersion} · observed vs threshold.</p>
      {widget.rows.map((row) => (
        <div key={row.name} className="flex items-center justify-between gap-2 border-b py-1.5 last:border-0">
          <div>
            <b>{row.name}</b>
            <div className="text-[9px] text-muted-foreground">{row.observed} vs {row.threshold}</div>
          </div>
          <Badge variant={row.result === 'pass' ? 'success' : 'danger'}>
            {row.result === 'pass' ? 'Pass' : 'Fail'}
          </Badge>
        </div>
      ))}
    </Frame>
  )
}

function AuditEventsWidget({ widget }: { widget: AuditWidget }) {
  const { go } = useWidgetActions()
  return (
    <Frame kind="audit_events">
      <p className={P}>Audit events for <b>{widget.object}</b>.</p>
      <div className="grid gap-1.5">
        {widget.events.map((event) => (
          <div key={event.id} className="flex gap-1.5">
            <span className="mt-1 size-1.5 flex-none rounded-full bg-primary" />
            <div>
              <div>{event.action}</div>
              <div className="text-[8.5px] text-muted-foreground">{event.ts} · {event.actor}</div>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-1.5" size="xs" variant="outline" onClick={() => go('/audit')}>
        Open audit log
      </Button>
    </Frame>
  )
}

function PipelineHealthWidget({ widget }: { widget: HealthWidget }) {
  const { openInfra } = useWidgetActions()
  return (
    <Frame kind="pipeline_health">
      <p className={P}>All demo services are healthy.</p>
      {widget.services.map((service) => (
        <div key={service.name} className="flex items-center gap-[7px] border-b py-1.5 text-[10px] last:border-0">
          <span className="size-1.5 flex-none rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="min-w-0 flex-1 truncate font-semibold">{service.name}</span>
          <span className="whitespace-nowrap text-[8.5px] text-muted-foreground">{service.meta}</span>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={`Open ${service.name}`}
            onClick={() => openInfra(service.key, service.meta)}
          >
            <ExternalLink />
          </Button>
        </div>
      ))}
    </Frame>
  )
}

export function AssistantWidget({ widget }: { widget: AssistantWidgetData }) {
  switch (widget.kind) {
    case 'queue_summary':
      return <QueueSummaryWidget widget={widget} />
    case 'dashboard_stats':
      return <DashboardStatsWidget widget={widget} />
    case 'vendors':
      return <VendorsWidgetView widget={widget} />
    case 'policy_change':
      return <PolicyChangeWidget widget={widget} />
    case 'report':
      return <ReportWidgetView widget={widget} />
    case 'search_documents':
      return <SearchDocumentsWidget widget={widget} />
    case 'document':
      return <DocumentWidgetView widget={widget} />
    case 'invoice_links':
      return <InvoiceLinksWidgetView widget={widget} />
    case 'match_trace':
      return <MatchTraceWidgetView widget={widget} />
    case 'guardrail_results':
      return <GuardrailResultsWidget widget={widget} />
    case 'audit_events':
      return <AuditEventsWidget widget={widget} />
    case 'pipeline_health':
      return <PipelineHealthWidget widget={widget} />
  }
}
