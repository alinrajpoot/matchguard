import { Controller, type FieldPath, type UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { Guardrail } from '@/schemas/domain'
import type { PolicyFormValues } from '@/schemas/forms'

const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-3 py-2'
const CARD_TITLE = 'text-[12.5px] font-semibold'

const SEVERITY_VARIANT: Record<Guardrail['severity'], 'danger' | 'warning' | 'info'> = {
  Block: 'danger',
  Warn: 'warning',
  Redact: 'info',
  Automation: 'info',
}

export function GuardrailGroup({
  title, description, keys, form, guardrails,
}: {
  title: string
  description: string
  keys: string[]
  form: UseFormReturn<PolicyFormValues>
  guardrails: Record<string, Guardrail>
}) {
  const enabled = keys.filter((key) => guardrails[key]?.on).length

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <div>
          <h3 className={CARD_TITLE}>{title}</h3>
          <span className="text-[9.5px] text-muted-foreground">{description}</span>
        </div>
        <Badge variant="neutral">{enabled}/{keys.length} on</Badge>
      </div>
      <div className="px-3 py-1">
        {keys.map((key) => {
          const guardrail = guardrails[key]
          if (!guardrail) return null
          return (
            <GuardrailRow key={key} guardrailKey={key} guardrail={guardrail} form={form} />
          )
        })}
      </div>
    </div>
  )
}

function GuardrailRow({
  guardrailKey, guardrail, form,
}: {
  guardrailKey: string
  guardrail: Guardrail
  form: UseFormReturn<PolicyFormValues>
}) {
  const onName = `guardrails.${guardrailKey}.on` as FieldPath<PolicyFormValues>
  const paramName = `guardrails.${guardrailKey}.param` as FieldPath<PolicyFormValues>

  return (
    <div className="flex items-center gap-[9px] border-b py-[7px] text-[11.5px] last:border-0">
      <Controller
        control={form.control}
        name={onName}
        render={({ field }) => (
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            aria-label={`Enable ${guardrail.name}`}
          />
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="font-semibold">{guardrail.name}</div>
        <div className="mt-px text-[9.5px] text-muted-foreground">{guardrail.desc}</div>
      </div>

      {guardrail.param === null ? (
        <div className="flex flex-none items-center gap-1">
          <Badge variant="neutral">{guardrail.paramLabel ?? guardrail.severity}</Badge>
        </div>
      ) : guardrail.control === 'range' ? (
        <Controller
          control={form.control}
          name={paramName}
          render={({ field }) => (
            <div className="flex flex-none items-center gap-1">
              <input
                type="range"
                aria-label={guardrail.name}
                className="h-[18px] w-[74px] accent-primary disabled:opacity-40"
                min={1}
                max={10}
                step={Number(guardrail.step ?? 0.5)}
                value={Number(field.value ?? 0)}
                onChange={(event) => field.onChange(Number(event.target.value))}
                disabled={!guardrail.on}
              />
              <span className="min-w-[34px] text-right text-[9.5px] font-semibold tabular-nums text-accent-foreground">
                {Number(field.value ?? 0).toFixed(1)}{guardrail.suffix ?? ''}
              </span>
            </div>
          )}
        />
      ) : (
        <Controller
          control={form.control}
          name={paramName}
          render={({ field }) => (
            <div className="flex flex-none items-center gap-1">
              <Input
                type="number"
                step={guardrail.step ?? '1'}
                aria-label={guardrail.name}
                className="h-[23px] w-[60px] px-[5px] text-right text-[10.5px]"
                disabled={!guardrail.on}
                value={typeof field.value === 'number' ? field.value : ''}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
              <span className="min-w-[34px] text-[9px] text-muted-foreground">
                {guardrail.suffix ?? ''}
              </span>
            </div>
          )}
        />
      )}

      <div className="w-14 text-center">
        <Badge variant={SEVERITY_VARIANT[guardrail.severity]}>{guardrail.severity}</Badge>
      </div>

      <span
        className="w-[26px] text-right text-[9.5px] tabular-nums text-muted-foreground"
        title="Triggers in the last 30 days"
      >
        {guardrail.triggers}
      </span>
    </div>
  )
}
