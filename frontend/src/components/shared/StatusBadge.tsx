import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const MAP: Record<string, { tone: Tone; label: string; pulse?: boolean }> = {
  auto: { tone: 'success', label: 'Auto-approved' },
  hitl: { tone: 'warning', label: 'HITL', pulse: true },
  rej: { tone: 'danger', label: 'Rejected' },
  processing: { tone: 'info', label: 'Processing', pulse: true },
  ready: { tone: 'success', label: 'Ready' },
  missing_grn: { tone: 'warning', label: 'Missing GRN' },
  missing_po: { tone: 'warning', label: 'Missing PO' },
  Indexed: { tone: 'success', label: 'Indexed' },
  'Needs review': { tone: 'warning', label: 'Needs review' },
  Failed: { tone: 'danger', label: 'Failed' },
  Uploading: { tone: 'info', label: 'Uploading', pulse: true },
  'IDP extraction': { tone: 'info', label: 'IDP extraction', pulse: true },
  Indexing: { tone: 'info', label: 'Indexing', pulse: true },
}

export function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { tone: 'neutral' as const, label: status }
  return (
    <Badge variant={entry.tone}>
      <span className={cn('size-1.5 rounded-full bg-current', entry.pulse && 'animate-pulse')} />
      {entry.label}
    </Badge>
  )
}
