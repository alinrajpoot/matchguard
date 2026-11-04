import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Lock, ShieldAlert, X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layout/PageHeader'
import { DocumentSpine } from '@/components/shared/DocumentSpine'
import { ErrorState } from '@/components/shared/ErrorState'
import { InfraChip } from '@/components/shared/InfraChip'
import { LoadingState } from '@/components/shared/LoadingState'
import { useDecideReview } from '@/hooks/mutations'
import { useReview } from '@/hooks/queries'
import { reviewDecisionSchema, type ReviewDecisionValues } from '@/schemas/forms'
import { LineComparison } from './LineComparison'

const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-4 py-2.5'
const CARD_TITLE = 'text-[15px] font-semibold'

export default function ReviewPage() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useReview(matchId)
  const decide = useDecideReview()
  const form = useForm<ReviewDecisionValues>({
    resolver: zodResolver(reviewDecisionSchema),
    defaultValues: { decision: 'approve', reason: '' },
  })
  const reason = useWatch({ control: form.control, name: 'reason' })
  const canApprove = (reason ?? '').trim().length >= 10

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const submit = (kind: 'approve' | 'reject') => {
    const result = reviewDecisionSchema.safeParse({ decision: kind, reason: form.getValues('reason') })
    if (!result.success) {
      form.setError('reason', { message: result.error.issues[0]?.message ?? 'Invalid reason' })
      return
    }
    decide.mutate(
      { matchId, decision: kind, reason: result.data.reason },
      {
        onSuccess: () => {
          toast(kind === 'approve'
            ? 'Approved and released. Recorded in the audit log.'
            : 'Rejected. Recorded in the audit log.')
          navigate('/queue')
        },
        onError: (error) => toast(error.message),
      },
    )
  }

  return (
    <>
      <PageHeader
        title={`Match ${matchId}`}
        subtitle={`${data.po ?? '—'} · ${data.vendor} · Invoice ${data.invoice}`}
        chips={['s3', 'pinecone', 'glassflow', 'postgres']}
        actions={<>
          <Button
            variant="outline"
            size="xs"
            className="border-danger/40 text-danger hover:bg-danger-bg hover:text-danger"
            disabled={decide.isPending}
            onClick={() => submit('reject')}
          >
            <X />Reject
          </Button>
          <Button
            size="xs"
            disabled={!canApprove || decide.isPending}
            title={canApprove ? undefined : 'Enter a reason to complete review'}
            onClick={() => submit('approve')}
          >
            {canApprove ? <Check /> : <Lock />}Approve & Release
          </Button>
        </>}
      />

      <div className="mb-[9px] flex flex-wrap items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg/60 px-3.5 py-3 text-[13px] text-warning">
        <ShieldAlert className="mt-px size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <b>Awaiting human review</b>
          <div className="mt-px text-[13px]">
            This match was escalated because the invoice variance of {data.variance.toFixed(1)}% exceeds
            the policy threshold of {data.threshold.toFixed(1)}%. Nothing is paid until you decide.
          </div>
        </div>
        <Button variant="outline" size="xs" asChild>
          <Link to="/policies">View policy</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-2.5 min-[1200px]:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0">
          <div className={`${CARD} mb-[9px]`}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Document chain</h3>
              <span className="text-[12px] text-muted-foreground">Three-way link · Invoice ↔ PO ↔ GRN</span>
            </div>
            <div className="p-3">
              <DocumentSpine invoice={data.invoice} po={data.po} grn={data.grn} />
              <div className="mt-[7px] flex flex-wrap gap-1.5">
                <InfraChip
                  service="s3"
                  resource={`s3://matchguard-demo-documents/invoices/${data.invoice}.pdf`}
                  label="Invoice on S3"
                />
                <InfraChip
                  service="pinecone"
                  resource={`idx-matchguard-docs · ${data.invoice}`}
                  label="Pinecone chunks"
                />
                <InfraChip
                  service="glassflow"
                  resource={`trace ${matchId}`}
                  label="GlassFlow trace"
                />
                <InfraChip
                  service="postgres"
                  resource={`audit_log · ${matchId}`}
                  label="Audit record"
                />
              </div>
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Line comparison</h3>
              <span className="text-[12px] text-muted-foreground">PO · GRN · Invoice</span>
            </div>
            <LineComparison invoice={data.invoice} lines={data.lines} />
          </div>

          <details className={`${CARD} mt-[9px]`}>
            <summary className="cursor-pointer px-3 py-2 text-[13px] font-semibold text-muted-foreground">
              Advanced · decision payload
            </summary>
            <div className="px-3 pb-3">
              <pre className="mono overflow-auto rounded-md bg-[#01173e] p-2.5 text-[12.5px] leading-[1.5] text-[#dce7f7]">
                {JSON.stringify(data.payload, null, 2)}
              </pre>
              <div className="mt-1.5">
                <InfraChip
                  service="glassflow"
                  resource={`trace ${matchId}`}
                  label="View trace in GlassFlow Rius"
                />
              </div>
            </div>
          </details>
        </div>

        <div className="grid gap-[9px]">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>System recommendation</h3>
              <Badge variant="warning">HOLD</Badge>
            </div>
            <div className="p-3 text-[13px] text-muted-foreground">{data.recommendation}</div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Guardrails</h3>
              <Badge variant="neutral">v{data.policyVersion}</Badge>
            </div>
            <div className="p-3">
              <div className="grid">
                {data.guardrails.map((guardrail) => (
                  <div
                    key={guardrail.name}
                    className="flex items-center justify-between gap-2 border-b py-1.5 text-[13px] last:border-0"
                  >
                    <div>
                      <div>{guardrail.name}</div>
                      <div className="mt-px text-[12.5px] text-muted-foreground">
                        {guardrail.observed} vs {guardrail.threshold}
                      </div>
                    </div>
                    <Badge variant={guardrail.result === 'pass' ? 'success' : 'danger'}>
                      {guardrail.result === 'pass' ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Decision</h3>
            </div>
            <div className="p-3">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className="sr-only">Reason for decision</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Reason for decision (required to approve)"
                          className="text-[13px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[12.5px]" />
                    </FormItem>
                  )}
                />
              </Form>
              <p className="mt-1 text-[12px] text-muted-foreground">
                This decision is recorded in the audit log with your user ID and timestamp.
              </p>
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Audit trail</h3>
              <Button variant="outline" size="xs" asChild>
                <Link to="/audit">Open log</Link>
              </Button>
            </div>
            <div className="p-3">
              <div className="grid gap-[7px]">
                {data.audit.map((entry) => (
                  <div
                    key={`${entry.time}-${entry.text}`}
                    className="flex gap-[7px] text-[13px] leading-[1.4]"
                  >
                    <span className="w-8 shrink-0 tabular-nums text-muted-foreground">{entry.time}</span>
                    <span>{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
