import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog'
import { InfraChip } from '@/components/shared/InfraChip'
import { KeyValueList } from '@/components/shared/KeyValueList'
import type { AuditEvent } from '@/schemas/domain'

export function AuditEvidenceDialog({
  event, open, onOpenChange,
}: {
  event: AuditEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] gap-0 p-0">
        <div className="flex items-center gap-2 border-b px-[13px] py-[10px] pr-10">
          <ScrollText className="size-4 text-muted-foreground" />
          <DialogTitle className="text-[14px] font-[650] tracking-[-0.01em]">
            Audit evidence · {event?.object}
          </DialogTitle>
          {event && <Badge variant={event.actor === 'You' ? 'accent' : 'neutral'}>{event.actor}</Badge>}
        </div>
        <DialogDescription className="sr-only">
          Evidence recorded for this audit event.
        </DialogDescription>

        {event && (
          <div className="p-[13px]">
            <KeyValueList
              items={[
                ['Timestamp', <span key="timestamp" className="mono">{event.ts} UTC</span>],
                ['Action', event.action],
                ['Object', <span key="object" className="mono">{event.object}</span>],
              ]}
            />
            <pre className="mt-[9px] overflow-auto rounded-md bg-[#01173e] p-[10px] font-mono text-[12.5px] leading-[1.5] text-[#dce7f7]">
              {JSON.stringify(event.evidence, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end gap-1.5 border-t bg-muted/40 px-[13px] py-[10px]">
          {event && (
            <InfraChip service="postgres" resource={`audit_log · ${event.object}`} label="Open Postgres table" />
          )}
          <Button size="xs" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
