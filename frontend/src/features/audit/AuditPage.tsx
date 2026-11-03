import { useState } from 'react'
import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAudit } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import type { AuditEvent } from '@/schemas/domain'
import { AuditEvidenceDialog } from './AuditEvidenceDialog'

const HEAD = 'text-[9px] uppercase tracking-[0.04em] text-muted-foreground'
const SELECT = 'h-7 rounded-md border border-input bg-transparent px-2 text-[11px] shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none'

export default function AuditPage() {
  const { data, isLoading, isError, refetch } = useAudit()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState<AuditEvent | null>(null)

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

  const actor = searchParams.get('actor') ?? 'all'
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const rows = data
    .filter((event) => actor === 'all' || event.actor === actor)
    .filter((event) => !query || `${event.actor} ${event.action} ${event.object}`.toLowerCase().includes(query))

  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Immutable record of every MatchGuard decision, retrieval and human action."
        chips={['fastapi', 'postgres']}
      />

      <div className="mb-[9px] flex flex-wrap items-center gap-1.5">
        <select
          aria-label="Filter by actor"
          className={SELECT}
          value={actor}
          onChange={(event) => updateParams({ actor: event.target.value === 'all' ? null : event.target.value })}
        >
          <option value="all">Actor: All</option>
          <option value="You">You</option>
          <option value="MatchGuard System">MatchGuard System</option>
        </select>
        <Input
          aria-label="Search audit log"
          placeholder="Search log"
          value={searchParams.get('q') ?? ''}
          onChange={(event) => updateParams({ q: event.target.value || null })}
          className="h-7 w-[220px] text-[11px]"
        />
        <span className="grow" />
        <Button
          variant="outline"
          size="xs"
          onClick={() => toast(`Audit export queued · ${rows.length} events (demo).`)}
        >
          <Download />Export
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table className="text-[11px]">
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Timestamp (UTC)</TableHead>
              <TableHead className={HEAD}>Actor</TableHead>
              <TableHead className={HEAD}>Action</TableHead>
              <TableHead className={HEAD}>Object</TableHead>
              <TableHead className={cn(HEAD, 'text-right')}>Evidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState title="No audit entries match this filter." />
                </TableCell>
              </TableRow>
            )}
            {rows.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="mono text-[10px] text-muted-foreground">{event.ts}</TableCell>
                <TableCell>
                  <Badge variant={event.actor === 'You' ? 'accent' : 'neutral'}>{event.actor}</Badge>
                </TableCell>
                <TableCell>{event.action}</TableCell>
                <TableCell className="mono text-[10px]">{event.object}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="xs"
                    className="h-auto p-0 text-[10.5px] font-semibold"
                    onClick={() => setSelected(event)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-[7px] text-[10px] text-muted-foreground">
        Audit logs are append-only and retained for 7 years. Table: <span className="mono">audit_log</span>
        {' · '}API: <span className="mono">GET /api/v1/audit</span>.
      </p>

      <AuditEvidenceDialog
        event={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
