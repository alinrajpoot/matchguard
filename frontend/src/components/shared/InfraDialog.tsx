import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useInfra } from '@/hooks/queries'
import { nowUTC } from '@/lib/format'
import { infraIcons } from '@/lib/icons'
import { useUiStore } from '@/stores/ui-store'

export function InfraDialog() {
  const infra = useUiStore((s) => s.infra)
  const close = useUiStore((s) => s.closeInfra)
  const { data } = useInfra()
  const entry = infra ? data?.[infra.key] : undefined
  const Icon = infra ? infraIcons[infra.key] ?? ExternalLink : ExternalLink
  const resource = infra?.resource ?? entry?.res ?? ''

  return (
    <Dialog open={Boolean(infra && entry)} onOpenChange={(open) => { if (!open) close() }}>
      <DialogContent className="max-w-[560px]">
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[13px]">
                <Icon className="size-4" />
                {entry.name}
                <Badge variant="success">Healthy</Badge>
              </DialogTitle>
              <DialogDescription className="sr-only">Infrastructure evidence</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-[86px_1fr] gap-x-2 gap-y-1 text-[10.5px]">
              <dt className="text-muted-foreground">Resource</dt><dd className="mono break-all">{resource}</dd>
              <dt className="text-muted-foreground">Region</dt><dd>{entry.region}</dd>
              <dt className="text-muted-foreground">Request ID</dt><dd className="mono">{entry.req}</dd>
              <dt className="text-muted-foreground">Observed</dt><dd className="mono">{nowUTC()} UTC</dd>
              <dt className="text-muted-foreground">Purpose</dt><dd>{entry.note}</dd>
            </dl>
            <p className="text-[10.5px] text-muted-foreground">
              This is demo evidence from a fictional environment. The link opens the real service console for illustration.
            </p>
            <DialogFooter>
              <Button variant="outline" size="xs" onClick={() => {
                navigator.clipboard.writeText(resource).then(
                  () => toast('Resource copied.'),
                  () => toast('Copy failed in this browser.'),
                )
              }}>
                <Copy /> Copy resource
              </Button>
              <Button asChild size="xs">
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open console
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
