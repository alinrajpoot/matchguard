import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { InfraChip } from '@/components/shared/InfraChip'
import { LoadingState } from '@/components/shared/LoadingState'
import { useDiscardPolicy, usePublishPolicy } from '@/hooks/mutations'
import { usePolicy } from '@/hooks/queries'
import { policyFormSchema, type PolicyFormValues } from '@/schemas/forms'
import type { Policy } from '@/schemas/domain'
import { GuardrailGroup } from './GuardrailGroup'
import { ImpactPreview } from './ImpactPreview'
import { ThresholdsCard } from './ThresholdsCard'

const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-3 py-2'
const CARD_TITLE = 'text-[12.5px] font-semibold'
const MINI_ROW = 'flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0'

const GROUPS = [
  {
    title: 'Document & linkage guardrails',
    description: 'Matching rules applied before any payment decision.',
    keys: [
      'priceVariance', 'quantityMatch', 'taxCompliance', 'evidenceGrounding',
      'duplicateInvoice', 'vendorBankChange', 'fxDrift', 'partialDelivery', 'missingLinkage',
    ],
  },
  {
    title: 'AI input / output guardrails',
    description: 'Protect the RAG pipeline itself, not just the invoice.',
    keys: [
      'promptInjection', 'piiRedaction', 'extractionFloor', 'citationRequired',
      'hallucinationBlock', 'unsupportedFile',
    ],
  },
  {
    title: 'Automation',
    description: 'Actions the workflow may take without a human.',
    keys: ['autoLink', 'autoApproveClean', 'autoRelease'],
  },
]

export default function PoliciesPage() {
  const { data, isLoading, isError, refetch } = usePolicy()

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return <PolicyForm key={`${data.version}-${data.dirty}`} policy={data} />
}

function PolicyForm({ policy }: { policy: Policy }) {
  const publish = usePublishPolicy()
  const discard = useDiscardPolicy()
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: policy.draft,
  })

  const dirty = form.formState.isDirty
  const watched = useWatch({ control: form.control }) as PolicyFormValues | undefined
  const values = watched ?? policy.draft
  const guardrails = values.guardrails ?? policy.draft.guardrails
  const enabled = Object.values(guardrails).filter((guardrail) => guardrail?.on).length
  const total = Object.keys(guardrails).length
  const projected = Math.max(
    0,
    Math.min(
      400,
      Math.round(
        177
        * (3 / Math.max(1, Number(values.priceTolerance) || 3))
        * (enabled / (policy.baseEnabled || 1)),
      ),
    ),
  )

  const onPublish = form.handleSubmit((draft) => {
    publish.mutate(draft, {
      onSuccess: (next) => {
        toast(`Policy v${next.version} published · recorded in the audit log.`)
        form.reset(next.draft)
      },
      onError: (error) => toast(error.message),
    })
  })

  const onDiscard = () => {
    discard.mutate(undefined, {
      onSuccess: (next) => {
        form.reset(next.draft)
        toast('Changes discarded. Policy is back to the published version.')
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Policy & Guardrails"
        subtitle="One policy for every match. Toggle a guardrail, tune its parameter, and preview the impact before publishing."
        chips={['fastapi', 'postgres']}
        actions={<>
          <Badge variant="accent">v{policy.version} · {policy.published}</Badge>
          {dirty && <Badge variant="warning">Unsaved changes</Badge>}
          <Button
            variant="outline"
            size="xs"
            disabled={!dirty || discard.isPending}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            size="xs"
            disabled={!dirty || publish.isPending}
            onClick={onPublish}
          >
            <Upload />Publish policy
          </Button>
        </>}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-[9px] max-[900px]:grid-cols-1">
        <div className="grid min-w-0 gap-[9px]">
          <ThresholdsCard form={form} />

          {GROUPS.map((group) => (
            <GuardrailGroup
              key={group.title}
              title={group.title}
              description={group.description}
              keys={group.keys}
              form={form}
              guardrails={guardrails}
            />
          ))}
        </div>

        <div className="grid gap-[9px] min-[900px]:sticky min-[900px]:top-[58px]">
          <ImpactPreview
            projected={projected}
            enabled={enabled}
            total={total}
            version={policy.version}
          />

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Version history</h3>
              <InfraChip service="postgres" resource="policy_versions · latest 5" />
            </div>
            <div className="px-3 py-2">
              {policy.history.map((entry) => (
                <div
                  key={entry.v}
                  className="flex justify-between gap-2 border-b py-1 text-[10.5px] last:border-0"
                >
                  <span>v{entry.v} · {entry.note}</span>
                  <span className="text-muted-foreground">{entry.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className={CARD_TITLE}>Publish checklist</h3>
            </div>
            <div className="px-3 py-2">
              <div className={MINI_ROW}>
                <span>Policy engine API</span>
                <InfraChip service="fastapi" resource="PUT /api/v1/policy" />
              </div>
              <div className={MINI_ROW}>
                <span>Version store</span>
                <InfraChip service="postgres" resource="policy_versions" />
              </div>
              <div className={MINI_ROW}>
                <span>Audit record</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => toast('Every publish is recorded in the audit log.')}
                >
                  Audit log
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
