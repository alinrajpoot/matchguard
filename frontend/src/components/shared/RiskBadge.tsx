import { Badge } from '@/components/ui/badge'

export function RiskBadge({ risk }: { risk: string }) {
  const variant = risk === 'High' ? 'danger' : risk === 'Medium' ? 'warning' : 'success'
  return <Badge variant={variant}>{risk}</Badge>
}
