import { Badge } from '@/components/ui/badge'

const W = 520
const H = 148
const PAD = 16
const MIN = 82
const MAX = 90
const TARGET = 85

export function StraightThroughChart({ values }: { values: number[] }) {
  const last = values[values.length - 1] ?? 0
  const span = values.length - 1 || 1
  const x = (i: number) => PAD + (i / span) * (W - PAD * 2)
  const y = (v: number) => H - PAD - ((v - MIN) / (MAX - MIN)) * (H - PAD * 2)
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `M${PAD},${H - PAD} L${points.split(' ').join(' L')} L${W - PAD},${H - PAD} Z`
  const label = `Straight-through rate over ${values.length} days, ending at ${last.toFixed(1)} percent against an 85 percent target`

  return (
    <>
      <div className="mb-[7px] flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[12.5px] font-semibold">Straight-through rate</h3>
          <div className="mt-px text-[10px] text-muted-foreground">Auto-approved share vs 85% target</div>
        </div>
        <Badge variant="success">{last.toFixed(1)}%</Badge>
      </div>
      <svg className="block h-auto w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {[84, 86, 88].map((v) => (
          <g key={v}>
            <line x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="#eef0f3" />
            <text x={PAD} y={y(v) - 3} fontSize={8} className="fill-muted-foreground">{v}%</text>
          </g>
        ))}
        <line x1={PAD} x2={W - PAD} y1={y(TARGET)} y2={y(TARGET)} stroke="#98a2b3" strokeDasharray="3 4" />
        <text x={W - PAD - 2} y={y(TARGET) - 4} textAnchor="end" fontSize={8} className="fill-muted-foreground">
          target 85%
        </text>
        <path d={area} fill="var(--chart-acc)" opacity={0.08} />
        <polyline points={points} fill="none" stroke="var(--chart-acc)" strokeWidth={2} />
        <circle cx={x(values.length - 1)} cy={y(last)} r={3} fill="var(--chart-acc)" stroke="#fff" strokeWidth={1.5} />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={6} fill="transparent">
            <title>{`Mar ${i + 1}: ${v.toFixed(1)}%`}</title>
          </circle>
        ))}
      </svg>
      <details className="mt-[7px] text-[10px] text-muted-foreground">
        <summary className="cursor-pointer select-none">View data table</summary>
        <table className="mt-1 w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b px-1 py-0.5 text-left text-[9.5px]">Day</th>
              <th className="border-b px-1 py-0.5 text-right text-[9.5px]">Rate</th>
              <th className="border-b px-1 py-0.5 text-right text-[9.5px]">Target</th>
            </tr>
          </thead>
          <tbody>
            {values.map((v, i) => (
              <tr key={i}>
                <td className="border-b px-1 py-0.5 text-left text-[9.5px]">{`Mar ${i + 1}`}</td>
                <td className="border-b px-1 py-0.5 text-right text-[9.5px]">{v.toFixed(1)}%</td>
                <td className="border-b px-1 py-0.5 text-right text-[9.5px]">85.0%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  )
}
