export function ConfidenceBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <span className="inline-flex items-center gap-[5px]">
      <span className="text-[10.5px] tabular-nums">{Math.round(value)}%</span>
      <span className="h-1 w-[38px] overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span
          className="block h-full rounded-full"
          style={{ width: `${clamped}%`, background: clamped < 90 ? 'var(--chart-warn)' : 'var(--chart-ok)' }}
        />
      </span>
    </span>
  )
}
