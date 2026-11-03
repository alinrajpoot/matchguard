import { Badge } from '@/components/ui/badge'
import type { DocType } from '@/schemas/domain'

const MAP: Record<DocType | 'Invoice', { variant: 'info' | 'warning' | 'success' | 'neutral'; label: string }> = {
  PO: { variant: 'info', label: 'PO' },
  GRN: { variant: 'warning', label: 'GRN' },
  INV: { variant: 'success', label: 'Invoice' },
  Invoice: { variant: 'success', label: 'Invoice' },
  Unknown: { variant: 'neutral', label: 'Unknown' },
}

export function TypeBadge({ type }: { type: DocType | 'Invoice' }) {
  const entry = MAP[type]
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}
