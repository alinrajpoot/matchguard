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
      className="mt-auto h-7 w-full pt-2"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={color} opacity={0.08} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
