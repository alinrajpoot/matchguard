type DonutPart = { label: string; value: number; color: string }

const R = 42
const C = 2 * Math.PI * R

export function DonutChart({ parts, total }: { parts: DonutPart[]; total: number }) {
  const sum = parts.reduce((acc, part) => acc + part.value, 0) || 1
  const ariaLabel = `Document pipeline: ${parts
    .map((part) => `${part.value.toLocaleString()} ${part.label.toLowerCase()}`)
    .join(', ')}`
  const offsets = parts.map((_, index) =>
    parts.slice(0, index).reduce((acc, part) => acc + C * (part.value / sum), 0),
  )

  return (
    <>
      <div className="mb-[7px]">
        <h3 className="text-[15px] font-semibold">Document pipeline</h3>
        <div className="mt-px text-[12.5px] text-muted-foreground">S3 → IDP/NER → Pinecone</div>
      </div>
      <div className="flex items-center gap-3">
        <svg className="h-[120px] w-[120px] shrink-0" viewBox="0 0 120 120" role="img" aria-label={ariaLabel}>
          {parts.map((part, index) => {
            const len = C * (part.value / sum)
            const visible = Math.max(0, len - (len > 4 ? 2 : 0))
            return (
              <circle
                key={part.label}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={part.color}
                strokeWidth={13}
                strokeDasharray={`${visible} ${C - visible}`}
                strokeDashoffset={-offsets[index]}
                transform="rotate(-90 60 60)"
              >
                <title>{`${part.label}: ${part.value}`}</title>
              </circle>
            )
          })}
          <text x="60" y="56" textAnchor="middle" className="fill-foreground text-[14px] font-bold">{total.toLocaleString()}</text>
          <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground text-[12px] uppercase tracking-[0.06em]">documents</text>
        </svg>
        <div className="grid min-w-0 gap-[5px] text-[12.5px] text-secondary-foreground">
          {parts.map((part) => (
            <div key={part.label} className="flex items-center justify-between gap-[10px]">
              <span>{part.label}</span>
              <b className="tabular-nums text-foreground">{part.value.toLocaleString()}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
