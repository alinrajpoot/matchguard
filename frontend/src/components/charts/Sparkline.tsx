export function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 70
  const h = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = values.length - 1 || 1
  const points = values
    .map((v, i) => `${(i / span) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`)
    .join(' ')

  return (
    <svg
      className="absolute bottom-[7px] right-[9px] h-6 w-[70px] opacity-85"
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.6} />
    </svg>
  )
}
