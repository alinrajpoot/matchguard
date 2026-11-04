export function HorizontalBars({ rows }: { rows: { name: string; value: number }[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <div>
      {rows.map((row) => (
        <div key={row.name} className="mb-1.5 grid grid-cols-[105px_1fr_26px] items-center gap-[7px] text-[13px] last:mb-0">
          <span>{row.name}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span className="text-right text-[12.5px] tabular-nums text-muted-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
