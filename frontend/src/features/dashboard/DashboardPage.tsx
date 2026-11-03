import { Download, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { DonutChart } from '@/components/charts/DonutChart'
import { HorizontalBars } from '@/components/charts/HorizontalBars'
import { OutcomeBars } from '@/components/charts/OutcomeBars'
import { Sparkline } from '@/components/charts/Sparkline'
import { StraightThroughChart } from '@/components/charts/StraightThroughChart'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { useDashboard, useQueue } from '@/hooks/queries'
import { money } from '@/lib/format'
import { infraIcons } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

const SLA_LABELS = ['Under 1 hour', '1–4 hours', '4–8 hours', 'Over 8 hours']
const SLA_TONE: Record<string, string> = {
  bad: 'text-danger',
  warn: 'text-warning',
  info: 'text-info',
  neutral: 'text-muted-foreground',
}
const PIPELINE_BADGE = ['success', 'info', 'warning', 'danger'] as const

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard()
  const { data: liveQueue } = useQueue()
  const openInfra = useUiStore((s) => s.openInfra)

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const queue = liveQueue ?? data.queue

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Accounts payable overview · Last 30 days"
        chips={['glassflow', 'github', 'ecr', 'ec2']}
        actions={<>
          <Badge variant="neutral">Last 30 days</Badge>
          <Button variant="outline" size="xs" onClick={() => toast('Export started · CSV generated from demo data.')}>
            <Download /> Export
          </Button>
        </>}
      />

      <div className="mb-2 grid grid-cols-6 gap-2 max-[1320px]:grid-cols-3 max-[900px]:grid-cols-2">
        {data.kpis.map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-lg border bg-card p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{kpi.label}</div>
            <div className="mt-0.5 text-[21px] font-semibold leading-tight tracking-[-0.025em] tabular-nums">{kpi.value}</div>
            <div className={cn('mt-0.5 flex items-center gap-1 text-[9.5px] font-semibold', kpi.neg ? 'text-danger' : 'text-success')}>
              {kpi.neg ? '▼' : '▲'} {kpi.delta}
            </div>
            <div className="mt-0.5 text-[9.5px] text-muted-foreground">{kpi.note}</div>
            <Sparkline values={kpi.spark} color={kpi.neg ? 'var(--chart-bad)' : 'var(--chart-acc)'} />
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-12 gap-2 max-[900px]:grid-cols-1">
        <div className="col-span-8 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-12 max-[900px]:col-span-1">
          <div className="p-3"><OutcomeBars data={data.outcomes} /></div>
        </div>

        <div className="col-span-4 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="p-3"><StraightThroughChart values={data.str} /></div>
        </div>

        <div className="col-span-4 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="p-3">
            <div className="mb-[7px]">
              <h3 className="text-[12.5px] font-semibold">Guardrail failures</h3>
              <div className="mt-px text-[10px] text-muted-foreground">Last 30 days · 141 events</div>
            </div>
            <HorizontalBars rows={data.guardrailFailures} />
          </div>
        </div>

        <div className="col-span-4 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="p-3"><DonutChart parts={data.pipeline} total={data.pipeline.reduce((sum, part) => sum + part.value, 0)} /></div>
        </div>

        <div className="col-span-4 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="p-3">
            <div className="mb-[7px]">
              <h3 className="text-[12.5px] font-semibold">SLA aging</h3>
              <div className="mt-px text-[10px] text-muted-foreground">Review queue</div>
            </div>
            <div className="grid">
              {data.slaAging.map((row, index) => (
                <div key={row.label} className="flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0">
                  <span>{SLA_LABELS[index] ?? row.label}</span>
                  <b className={cn('tabular-nums', SLA_TONE[row.tone])}>{row.count}</b>
                </div>
              ))}
            </div>
            <Button variant="outline" size="xs" className="mt-[7px]" asChild>
              <Link to="/queue">Open queue</Link>
            </Button>
          </div>
        </div>

        <div className="col-span-7 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <h3 className="text-[12.5px] font-semibold">Vendor risk</h3>
            <Button variant="outline" size="xs" asChild>
              <Link to="/invoices">View invoices</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="text-left text-[9.5px] uppercase tracking-[0.04em] text-muted-foreground">
                  <th className="px-3 py-1.5 font-semibold">Vendor</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Matches</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Avg variance</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Exposure</th>
                  <th className="px-3 py-1.5 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.vendors.map((vendor) => (
                  <tr key={vendor.name} className="border-t">
                    <td className="px-3 py-1.5 font-semibold">{vendor.name}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{vendor.matches}</td>
                    <td className={cn('px-3 py-1.5 text-right tabular-nums', vendor.variance <= 3 && 'text-muted-foreground')}>
                      {vendor.variance.toFixed(1)}%
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{money(vendor.exposure)}</td>
                    <td className="px-3 py-1.5"><RiskBadge risk={vendor.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-5 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <h3 className="text-[12.5px] font-semibold">Review queue</h3>
            <Button variant="outline" size="xs" asChild>
              <Link to="/queue">View all {queue.length}</Link>
            </Button>
          </div>
          <div className="p-3 pt-[3px]">
            {queue.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0">
                <div>
                  <b>{item.id}</b>
                  <div className="mt-px text-[10px] text-muted-foreground">{item.vendor}</div>
                </div>
                <div className="text-right">
                  <b className="tabular-nums">{item.variance.toFixed(1)}%</b>
                  <div className="mt-px text-[10px] text-muted-foreground">{item.sla} left</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <h3 className="text-[12.5px] font-semibold">Recent activity</h3>
            <span className="text-[9.5px] text-muted-foreground">system + you</span>
          </div>
          <div className="p-3">
            <div className="grid gap-[7px]">
              {data.activity.map((item) => (
                <div key={`${item.text}-${item.time}`} className="flex gap-[7px] text-[10.5px] leading-[1.4]">
                  <span
                    className="mt-1 size-1.5 shrink-0 rounded-full"
                    style={{ background: `var(--chart-${item.tone})` }}
                  />
                  <div>
                    <div>{item.text}</div>
                    <div className="text-[9px] text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5 min-w-0 rounded-lg border bg-card max-[1320px]:col-span-6 max-[900px]:col-span-1">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <h3 className="text-[12.5px] font-semibold">Document pipeline</h3>
            <Button variant="outline" size="xs" asChild>
              <Link to="/documents">Open documents</Link>
            </Button>
          </div>
          <div className="p-3">
            <div className="grid">
              {data.pipeline.map((part, index) => (
                <div key={part.label} className="flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0">
                  <span>{part.label}</span>
                  <Badge variant={PIPELINE_BADGE[index] ?? 'neutral'}>{part.value.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <h3 className="text-[12.5px] font-semibold">Infrastructure health</h3>
          <span className="text-[10px] text-muted-foreground">live demo signals</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 p-3 max-[1320px]:grid-cols-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {data.infraHealth.map((service) => {
            const Icon = infraIcons[service.key] ?? ExternalLink
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => openInfra(service.key, service.res)}
                title={`Open ${service.name} evidence`}
                className="min-w-0 rounded-md border bg-card p-2 text-left hover:border-primary/40"
              >
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold">
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{service.name}</span>
                </div>
                <div className="mt-0.5 truncate text-[9px] text-muted-foreground">{service.res}</div>
                <div className="mt-1 flex items-center gap-1 text-[9px] text-success">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Healthy
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
