import { Activity, UserCheck, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { DocumentSpine } from '@/components/shared/DocumentSpine'
import { KeyValueList } from '@/components/shared/KeyValueList'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useRun } from '@/hooks/queries'
import { money } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'

const HEAD = 'text-[15px] font-semibold'

export function RunDialog({ runId, onOpenChange }: {
  runId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const { data } = useRun(runId ?? '')
  const navigate = useNavigate()
  const openInfra = useUiStore((state) => state.openInfra)

  return (
    <Dialog open={Boolean(runId)} onOpenChange={onOpenChange}>
      {runId && (
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[760px]">
          <DialogHeader className="flex-row flex-wrap items-center gap-2 border-b px-4 py-3 pr-10">
            <DialogTitle className="text-[15px] font-semibold">{runId}</DialogTitle>
            {data && <StatusBadge status={data.run.status} />}
            {data && <Badge variant="neutral">{data.run.vendor}</Badge>}
          </DialogHeader>
          <DialogDescription className="sr-only">
            Match trace, guardrail results, and evidence sources for {runId}.
          </DialogDescription>

          <div className="min-h-0 space-y-2 overflow-y-auto p-4">
            {data && <DocumentSpine invoice={data.run.invoice} po={data.run.po} grn={data.run.grn} />}

            <div className="grid grid-cols-2 gap-2 max-[700px]:grid-cols-1">
              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-2.5">
                  <h3 className={HEAD}>Match</h3>
                </div>
                <div className="p-3">
                  {data ? (
                    <KeyValueList items={[
                      ['Amount', <span key="amount" className="tabular-nums">{money(data.run.amount)}</span>],
                      ['Variance', <span key="variance" className="tabular-nums">{data.run.variance.toFixed(1)}%</span>],
                      ['Confidence', `${data.run.confidence}%`],
                      ['Duration', data.run.duration],
                      ['Age', data.run.age],
                    ]} />
                  ) : (
                    <div className="text-[13px] text-muted-foreground">Loading…</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                  <h3 className={HEAD}>Guardrails</h3>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openInfra('fastapi', `GET /api/v1/guardrails/${runId}`)}
                  >
                    <Zap />API
                  </Button>
                </div>
                <div className="p-3">
                  {data ? (
                    <div className="grid">
                      {data.guardrails.map((guardrail) => (
                        <div
                          key={guardrail.name}
                          className="flex items-center justify-between gap-2 border-b py-1.5 text-[13px] last:border-0"
                        >
                          <span>{guardrail.name}</span>
                          <Badge variant={guardrail.result === 'Pass' ? 'success' : 'danger'}>
                            {guardrail.result}
                          </Badge>
                          <span className="text-[12px] tabular-nums text-muted-foreground">{guardrail.meta}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[13px] text-muted-foreground">Loading…</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                  <h3 className={HEAD}>LangGraph trace</h3>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openInfra('glassflow', `trace ${runId}`)}
                  >
                    <Activity />GlassFlow Rius
                  </Button>
                </div>
                <div className="p-3">
                  {data ? (
                    <div className="grid gap-[5px]">
                      {data.trace.map((node, index) => (
                        <div key={node.name} className="flex items-start gap-1.5 text-[12.5px]">
                          <span className="flex size-[15px] shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold">{node.name}</div>
                            <div className="text-[12px] text-muted-foreground">{node.meta}</div>
                          </div>
                          <div className="text-[12px] tabular-nums text-muted-foreground">{node.ms} ms</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[13px] text-muted-foreground">Loading…</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="border-b px-4 py-2.5">
                  <h3 className={HEAD}>Evidence sources</h3>
                </div>
                <div className="p-3">
                  {data ? (
                    <div className="grid">
                      <div className="flex items-center justify-between gap-2 border-b py-1.5 text-[13px] last:border-0">
                        <span>Invoice PDF</span>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openInfra('s3', `s3://matchguard-demo-documents/invoices/${data.run.invoice}.pdf`)}
                        >
                          S3
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-b py-1.5 text-[13px] last:border-0">
                        <span>Pinecone chunks</span>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openInfra('pinecone', `idx-matchguard-docs · ${data.run.invoice}`)}
                        >
                          Vectors
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-b py-1.5 text-[13px] last:border-0">
                        <span>Checkpoint</span>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openInfra('postgres', `checkpoint thread ${runId}`)}
                        >
                          Postgres
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-muted-foreground">Loading…</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-end gap-1.5 border-t px-4 py-2.5">
            <Button variant="outline" size="xs" onClick={() => onOpenChange(false)}>Close</Button>
            {data?.run.status === 'hitl' && (
              <Button
                size="xs"
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/review/${runId}`)
                }}
              >
                <UserCheck />Open review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
