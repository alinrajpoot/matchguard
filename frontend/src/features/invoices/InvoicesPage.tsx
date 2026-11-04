import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useRunMatch } from '@/hooks/mutations'
import { useInvoices } from '@/hooks/queries'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/schemas/domain'
import { InvoiceChain } from './InvoiceChain'

const HEAD = 'text-[12px] uppercase tracking-[0.05em] text-muted-foreground'

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'missing_po', label: 'Missing PO' },
  { value: 'missing_grn', label: 'Missing GRN' },
  { value: 'processing', label: 'Processing' },
] as const

const STAT_CARDS = [
  { key: 'ready', label: 'Ready to match', sub: 'Invoice + PO + GRN linked' },
  { key: 'missing_po', label: 'Missing PO', sub: 'Invoice + GRN present' },
  { key: 'missing_grn', label: 'Missing GRN', sub: 'Invoice + PO present' },
  { key: 'processing', label: 'Processing', sub: 'IDP or linkage running' },
] as const

function runTitle(status: Invoice['status']) {
  if (status === 'ready') return 'Run three-way match'
  if (status === 'processing') return 'IDP extraction is still running'
  return `Cannot run: ${status === 'missing_grn' ? 'GRN' : 'PO'} is missing`
}

export default function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useInvoices()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const runMatch = useRunMatch()
  const [expanded, setExpanded] = useState<string[]>([])
  const [flashed, setFlashed] = useState<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const updateParams = useCallback((patch: Record<string, string | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    }, { replace: true })
  }, [setSearchParams])

  const focus = searchParams.get('focus')
  const rawStatus = searchParams.get('status') ?? 'all'
  const status = STATUS_TABS.some((tab) => tab.value === rawStatus) ? rawStatus : 'all'

  useEffect(() => {
    if (!focus || !data) return
    if (!data.some((invoice) => invoice.id === focus)) {
      toast('That invoice has already been matched.')
      updateParams({ focus: null })
      return
    }
    updateParams({ focus: null, status: null, q: null, vendor: null })
    // The deep link is external state; expand and highlight the focused row.
    // oxlint-disable-next-line react/set-state-in-effect
    setExpanded((current) => (current.includes(focus) ? current : [...current, focus]))
    setFlashed(focus)
  }, [focus, data, updateParams])

  useEffect(() => {
    if (!flashed) return
    rowRefs.current[flashed]?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    const timer = setTimeout(() => setFlashed(null), 1800)
    return () => clearTimeout(timer)
  }, [flashed])

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const invoices = data
  const counts: Record<Invoice['status'], number> = {
    ready: 0, missing_po: 0, missing_grn: 0, processing: 0,
  }
  invoices.forEach((invoice) => { counts[invoice.status] += 1 })

  const vendors = Array.from(new Set(invoices.map((invoice) => invoice.vendor)))
  const vendor = searchParams.get('vendor') ?? 'all'
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const filtered = invoices
    .filter((invoice) => status === 'all' || invoice.status === status)
    .filter((invoice) => vendor === 'all' || invoice.vendor === vendor)
    .filter((invoice) => !query || `${invoice.no} ${invoice.vendor}`.toLowerCase().includes(query))

  const toggleChain = (id: string) => setExpanded((current) => (
    current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
  ))

  const run = (invoice: Invoice) => {
    runMatch.mutate(invoice.id, {
      onSuccess: (created) => {
        toast(`Match ${created.id} started · LangGraph retrieve → compare → guardrail → decide`)
        navigate('/runs')
      },
      onError: (error) => toast(error.message),
    })
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Recognized invoices only. Run a three-way match when the invoice, PO and GRN are all linked."
        chips={['s3', 'pinecone', 'postgres', 'bedrock']}
      />

      <div className="mb-[9px] grid grid-cols-4 gap-2 max-[900px]:grid-cols-2">
        {STAT_CARDS.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => updateParams({ status: card.key })}
            className={cn(
              'rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/30',
              status === card.key && 'border-primary/50 bg-accent shadow-[inset_0_0_0_1px_var(--primary)]',
            )}
          >
            <div className="text-[12px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">
              {card.label}
            </div>
            <div className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] tabular-nums">
              {counts[card.key]}
            </div>
            <div className="mt-px text-[12px] text-muted-foreground">{card.sub}</div>
          </button>
        ))}
      </div>

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
          aria-label="Search invoices"
          placeholder="Search invoice or vendor"
          value={searchParams.get('q') ?? ''}
          onChange={(event) => updateParams({ q: event.target.value || null })}
          className="h-9 w-[210px] text-[13px]"
        />
        <Select
          value={vendor}
          onValueChange={(value) => updateParams({ vendor: value === 'all' ? null : value })}
        >
          <SelectTrigger size="sm" aria-label="Filter by vendor" className="h-9 w-[210px] text-[13px]">
            <SelectValue placeholder="Vendor: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vendor: All</SelectItem>
            {vendors.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="grow" />
        <span className="text-[12.5px] text-muted-foreground">{invoices.length} invoices</span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 max-[1200px]:hidden" />
              <TableHead className={HEAD}>Invoice #</TableHead>
              <TableHead className={HEAD}>Vendor</TableHead>
              <TableHead className={HEAD}>Dates</TableHead>
              <TableHead className={`${HEAD} text-right`}>Amount</TableHead>
              <TableHead className={HEAD}>Link status</TableHead>
              <TableHead className={`${HEAD} text-right`}>Actions</TableHead>
              <TableHead className={`${HEAD} max-[1200px]:hidden`}>PO</TableHead>
              <TableHead className={`${HEAD} max-[1200px]:hidden`}>GRN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="p-0">
                  <EmptyState title="No invoices match this filter." />
                </TableCell>
              </TableRow>
            )}
            {filtered.map((invoice) => {
              const ready = invoice.status === 'ready'
              return (
                <Fragment key={invoice.id}>
                  <TableRow
                    ref={(node) => { rowRefs.current[invoice.id] = node }}
                    className={cn(flashed === invoice.id && 'animate-pulse ring-2 ring-primary ring-inset')}
                  >
                    <TableCell className="max-[1200px]:hidden">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label="Toggle document chain"
                        onClick={() => toggleChain(invoice.id)}
                      >
                        <ChevronDown className={cn('transition-transform', expanded.includes(invoice.id) && 'rotate-180')} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{invoice.no}</div>
                      <div className="mt-px text-[12.5px] text-muted-foreground">{invoice.id}</div>
                    </TableCell>
                    <TableCell>{invoice.vendor}</TableCell>
                    <TableCell>
                      <div className="tabular-nums">{invoice.date}</div>
                      <div className="mt-px text-[12.5px] text-muted-foreground tabular-nums">Due {invoice.due}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{money(invoice.amount)}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="xs"
                          disabled={!ready || runMatch.isPending}
                          title={runTitle(invoice.status)}
                          aria-label={`Run match for ${invoice.no}`}
                          onClick={() => run(invoice)}
                        >
                          <Play /><span className="hidden min-[1200px]:inline">Run match</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-[900px]:hidden">
                      {invoice.po
                        ? <Badge variant="info">{invoice.po}</Badge>
                        : <Badge variant="warning">Missing</Badge>}
                    </TableCell>
                    <TableCell className="max-[900px]:hidden">
                      {invoice.grn
                        ? <Badge variant="warning">{invoice.grn}</Badge>
                        : <Badge variant="warning">Missing</Badge>}
                    </TableCell>
                  </TableRow>
                  {expanded.includes(invoice.id) && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="whitespace-normal p-0">
                        <InvoiceChain invoice={invoice} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
