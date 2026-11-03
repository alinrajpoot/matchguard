import { Controller, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { PolicyFormValues } from '@/schemas/forms'

const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-3 py-2'
const CARD_TITLE = 'text-[12.5px] font-semibold'

const NUMBER_FIELDS = [
  { name: 'quantityTolerance', label: 'Quantity tolerance', step: 1 },
  { name: 'extractionConfidence', label: 'Extraction confidence floor', step: 1 },
  { name: 'matchConfidence', label: 'Match confidence floor', step: 1 },
  { name: 'hitlAmount', label: 'Amount requiring HITL ($)', step: 500 },
  { name: 'autoReleaseCap', label: 'Auto-release cap ($)', step: 50 },
  { name: 'hitlSla', label: 'HITL SLA (business hours)', step: 1 },
  { name: 'duplicateLookback', label: 'Duplicate lookback (days)', step: 1 },
] as const

export function ThresholdsCard({ form }: { form: UseFormReturn<PolicyFormValues> }) {
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <h3 className={CARD_TITLE}>Matching thresholds</h3>
        <span className="text-[9.5px] text-muted-foreground">policy engine inputs</span>
      </div>
      <div className="p-3">
        <Controller
          control={form.control}
          name="priceTolerance"
          render={({ field }) => (
            <div className="border-b py-[7px] last:border-0">
              <div className="flex items-center justify-between gap-2 text-[11.5px] font-medium">
                <span>Price variance tolerance</span>
                <b className="tabular-nums text-accent-foreground">
                  {Number(field.value).toFixed(1)}%
                </b>
              </div>
              <div className="mt-0.5 text-[9.5px] text-muted-foreground">
                Escalate when any invoice line differs from the PO by more than this.
              </div>
              <Slider
                aria-label="Price variance tolerance"
                className="mt-1"
                min={1}
                max={10}
                step={0.5}
                value={[Number(field.value)]}
                onValueChange={(value) => field.onChange(value[0] ?? 1)}
              />
            </div>
          )}
        />

        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-[9px]">
          {NUMBER_FIELDS.map((field) => (
            <div key={field.name}>
              <Label
                htmlFor={`threshold-${field.name}`}
                className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
              >
                {field.label}
              </Label>
              <Input
                id={`threshold-${field.name}`}
                type="number"
                step={field.step}
                className="h-7 text-[11px]"
                {...form.register(field.name, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
