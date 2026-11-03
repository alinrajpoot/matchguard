import { useState, type MouseEvent } from 'react'
import { Activity, Cloud, Database, Download } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfidenceBar } from '@/components/charts/ConfidenceBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useRuns } from '@/hooks/queries'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Run } from '@/schemas/domain'
import { useUiStore } from '@/stores/ui-store'
import { RunDialog } from './RunDialog'

const HEAD = 'text-[9px] uppercase tracking-[0.04em] text-muted-foreground'

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'auto', label: 'Auto-approved' },
  { value: 'hitl', label: 'HITL' },
  { value: 'rej', label: 'Rejected' },
  { value: 'processing', label: 'Processing' },
] as const

export default function RunsPage() {
  const { data, isLoading, isError, refetch } = useRuns()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const openInfra = useUiStore((state) => state.openInfra)
  const [openRunId, setOpenRunId] = useState<string | null>(null)

  const updateParams = (patch: Record<string, string | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    }, { replace: true })
  }

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const runs = data
  const rawStatus = searchParams.get('status') ?? 'all'
  const status = STATUS_TABS.some((tab) => tab.value === rawStatus) ? rawStatus : 'all'
  const vendor = searchParams.get('vendor') ?? 'all'
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  const vendors = Array.from(new Set(runs.map((run) => run.vendor)))
  const filtered = runs
    .filter((run) => status === 'all' || run.status === status)
    .filter((run) => vendor === 'all' || run.vendor === vendor)
    .filter((run) => !query || `${run.id} ${run.invoice} ${run.po} ${run.grn} ${run.vendor}`.toLowerCase().includes(query))

  const openRow = (event: MouseEvent<HTMLTableRowElement>, run: Run) => {
    if ((event.target as HTMLElement).closest('button, a')) return
    if (run.status === 'hitl') navigate(`/review/${run.id}`)
    else setOpenRunId(run.id)
  }

  return (
    <>
      <PageHeader
        title="Match Runs"
        subtitle="Every three-way match across your vendors, with a trace back to each source document."
        chips={['glassflow', 'langgraph', 'bedrock']}
        actions={(
          <Button
            variant="outline"
            size="xs"
            onClick={() => toast('Export started · runs CSV generated from demo data.')}
          >
            <Download />Export CSV
          </Button>
        )}
      />

      <Tabs
        value={status}
        onValueChange={(value) => updateParams({ status: value === 'all' ? null : value })}
        className="mb-[9px] gap-[9px]"
      >
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mb-[9px] flex flex-wrap items-center gap-1.5">
        <Input
          aria-label="Search match runs"
          placeholder="Search match, invoice or vendor"
          value={searchParams.get('q') ?? ''}
          onChange={(event) => updateParams({ q: event.target.value || null })}
          className="h-7 w-[230px] text-[11px]"
        />
        <Select
          value={vendor}
          onValueChange={(value) => updateParams({ vendor: value === 'all' ? null : value })}
        >
          <SelectTrigger size="sm" aria-label="Filter by vendor" className="h-7 w-[210px] text-[11px]">
            <SelectValue placeholder="Vendor: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vendor: All</SelectItem>
            {vendors.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="grow" />
        <span className="text-[10px] text-muted-foreground">Click a row for trace · HITL opens review</span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table className="text-[11px]">
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Match ID</TableHead>
              <TableHead className={HEAD}>Invoice</TableHead>
              <TableHead className={HEAD}>PO</TableHead>
              <TableHead className={HEAD}>GRN</TableHead>
              <TableHead className={HEAD}>Vendor</TableHead>
              <TableHead className={`${HEAD} text-right`}>Amount</TableHead>
              <TableHead className={`${HEAD} text-right`}>Variance</TableHead>
              <TableHead className={HEAD}>Confidence</TableHead>
              <TableHead className={`${HEAD} text-center`}>Status</TableHead>
              <TableHead className={HEAD}>Duration</TableHead>
              <TableHead className={HEAD}>Age</TableHead>
              <TableHead className={`${HEAD} text-right`}>Evidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="p-0">
                  <EmptyState title="No matches found." />
                </TableCell>
              </TableRow>
            )}
            {filtered.map((run) => (
              <TableRow key={run.id} className="cursor-pointer" onClick={(event) => openRow(event, run)}>
                <TableCell>
                  <div className="font-semibold text-accent-foreground">{run.id}</div>
                </TableCell>
                <TableCell>{run.invoice}</TableCell>
                <TableCell>{run.po}</TableCell>
                <TableCell>{run.grn}</TableCell>
                <TableCell>{run.vendor}</TableCell>
                <TableCell className="text-right tabular-nums">{money(run.amount)}</TableCell>
                <TableCell className={cn('text-right tabular-nums', run.variance > 3 && 'font-semibold text-warning')}>
                  {run.variance.toFixed(1)}%
                </TableCell>
                <TableCell><ConfidenceBar value={run.confidence} /></TableCell>
                <TableCell className="text-center"><StatusBadge status={run.status} /></TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{run.duration}</TableCell>
                <TableCell className="text-muted-foreground">{run.age}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="iconSm"
                      aria-label={`Open GlassFlow trace for ${run.id}`}
                      title="Open GlassFlow trace"
                      onClick={() => openInfra('glassflow', `trace ${run.id} · LangGraph run`)}
                    >
                      <Activity />
                    </Button>
                    <Button
                      variant="outline"
                      size="iconSm"
                      aria-label={`View source documents for ${run.id}`}
                      title="View source documents"
                      onClick={() => openInfra('s3', `s3://matchguard-demo-documents/invoices/${run.invoice}.pdf`)}
                    >
                      <Cloud />
                    </Button>
                    <Button
                      variant="outline"
                      size="iconSm"
                      aria-label={`View Pinecone vectors for ${run.id}`}
                      title="View vectors"
                      onClick={() => openInfra('pinecone', `idx-matchguard-docs · ${run.invoice}`)}
                    >
                      <Database />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RunDialog
        runId={openRunId}
        onOpenChange={(open) => { if (!open) setOpenRunId(null) }}
      />
    </>
  )
}
