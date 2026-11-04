import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/ui-store'
import { infraIcons } from '@/lib/icons'
import { useInfra } from '@/hooks/queries'

export function InfraChip({ service, resource, label }: { service: string; resource?: string; label?: string }) {
  const openInfra = useUiStore((s) => s.openInfra)
  const { data: infra } = useInfra()
  const entry = infra?.[service]
  const Icon = infraIcons[service] ?? ExternalLink
  if (!entry) return null
  return (
    <Button
      variant="outline"
      size="xs"
      className="max-w-[230px] font-medium text-secondary-foreground/90"
      title={`${entry.name} · ${entry.note}`}
      onClick={() => openInfra(service, resource ?? entry.res)}
    >
      <Icon />
      <span className="truncate">{label ?? entry.chip}</span>
      <ExternalLink className="opacity-70" />
    </Button>
  )
}
