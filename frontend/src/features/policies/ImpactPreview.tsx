const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-4 py-2.5'
const CARD_TITLE = 'text-[15px] font-semibold'

const TOTAL_MATCHES = 1284
const BASELINE = 177

export function ImpactPreview({
  projected, enabled, total, version,
}: {
  projected: number
  enabled: number
  total: number
  version: number
}) {
  const percent = (projected / TOTAL_MATCHES) * 100
  const delta = projected === BASELINE
    ? ' — no change'
    : ` — ${projected < BASELINE ? '−' : '+'}${Math.abs(projected - BASELINE)} vs today`

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <h3 className={CARD_TITLE}>Impact preview</h3>
        <span className="text-[12px] text-muted-foreground">last 30 days</span>
      </div>
      <div className="p-3">
        <div className="text-[28px] font-[650] leading-[1.1] tracking-[-0.03em] tabular-nums">
          {projected}
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          of 1,284 matches would go to review ({percent.toFixed(1)}%){delta}.
        </div>
        <div className="mt-[7px] h-1.5 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-chart-warn"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 border-b py-1.5 text-[13px]">
          <span>Guardrails enabled</span>
          <b className="tabular-nums">{enabled}/{total}</b>
        </div>
        <div className="flex items-center justify-between gap-2 py-1.5 text-[13px]">
          <span>Policy version</span>
          <b>v{version}</b>
        </div>
      </div>
    </div>
  )
}
