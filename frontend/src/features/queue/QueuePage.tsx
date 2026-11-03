import type { ReactNode } from 'react'
import { SlidersHorizontal, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { HorizontalBars } from '@/components/charts/HorizontalBars'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { usePolicy, useQueue } from '@/hooks/queries'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'

const HEAD = 'text-[9px] uppercase tracking-[0.04em] text-muted-foreground'

const AGING = [
  ['Under 1 hour', 2],
  ['1–4 hours', 3],
  ['4–8 hours', 4],
  ['Over 8 hours', 1],
] as const

const FAILURE_MIX = [
  { name: 'Price variance', value: 64 },
  { name: 'Quantity', value: 31 },
  { name: 'Tax', value: 18 },
  { name: 'Grounding', value: 12 },
  { name: 'Duplicate', value: 9 },
  { name: 'Missing GRN', value: 7 },
]

function SideCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="text-[12.5px] font-semibold">{title}</h3>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0">
      <span>{label}</span>
      <b className="tabular-nums">{value}</b>
    </div>
  )
}

export default function QueuePage() {
  const queueQuery = useQueue()
  const policyQuery = usePolicy()

  if (queueQuery.isLoading || policyQuery.isLoading) return <LoadingState />
  if (queueQuery.isError || policyQuery.isError || !queueQuery.data || !policyQuery.data) {
    return (
      <ErrorState onRetry={() => {
        queueQuery.refetch()
        policyQuery.refetch()
      }} />
    )
  }

  const queue = queueQuery.data
  const policy = policyQuery.data

  return (
    <>
      <PageHeader
        title="Review Queue"
        subtitle={`${queue.length} matches awaiting your decision · 177 escalated in the last 30 days.`}
        chips={['postgres', 'glassflow', 'langgraph']}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_310px] items-start gap-[9px] max-[900px]:grid-cols-1">
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table className="text-[11px]">
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Match</TableHead>
                <TableHead className={HEAD}>Invoice</TableHead>
                <TableHead className={HEAD}>Vendor</TableHead>
                <TableHead className={`${HEAD} text-right`}>Amount</TableHead>
                <TableHead className={`${HEAD} text-right`}>Variance</TableHead>
                <TableHead className={HEAD}>Risk</TableHead>
                <TableHead className={HEAD}>SLA</TableHead>
                <TableHead className={`${HEAD} text-right`} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState title="Queue is clear. Escalated matches will appear here." />
                  </TableCell>
                </TableRow>
              )}
              {queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.id}</TableCell>
                  <TableCell>{item.invoice}</TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(item.amount)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-warning">
                    {item.variance.toFixed(1)}%
                  </TableCell>
                  <TableCell><RiskBadge risk={item.risk} /></TableCell>
                  <TableCell className={cn('tabular-nums', parseInt(item.sla, 10) < 1 && 'font-semibold text-danger')}>
                    {item.sla} left
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="xs" asChild>
                        <Link to={`/review/${item.id}`}><UserCheck />Review</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-[9px] max-[900px]:static">
          <SideCard
            title="Active policy"
            action={(
              <Button variant="outline" size="xs" asChild>
                <Link to="/policies"><SlidersHorizontal />Edit</Link>
              </Button>
            )}
          >
            <div className="grid">
              <MiniRow label="Variance threshold" value={`${policy.draft.priceTolerance.toFixed(1)}%`} />
              <MiniRow label="Amount threshold" value={money(policy.draft.hitlAmount)} />
              <MiniRow label="HITL SLA" value={`${policy.draft.hitlSla} business hours`} />
              <MiniRow label="Policy version" value={`v${policy.version}`} />
            </div>
          </SideCard>

          <SideCard title="Queue aging">
            <div className="grid">
              {AGING.map(([label, count]) => (
                <MiniRow key={label} label={label} value={count} />
              ))}
            </div>
          </SideCard>

          <SideCard title="Guardrail failure mix">
            <HorizontalBars rows={FAILURE_MIX} />
          </SideCard>
        </div>
      </div>
    </>
  )
}
