import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type Outcome = { d: string; a: number; h: number; r: number }

const SEGMENTS = [
  { key: 'a', label: 'Auto-approved', color: 'var(--chart-ok)' },
  { key: 'h', label: 'Approved after review', color: 'var(--chart-warn)' },
  { key: 'r', label: 'Rejected', color: 'var(--chart-bad)' },
] as const

export function OutcomeBars({ data }: { data: Outcome[] }) {
  const [showData, setShowData] = useState(false)
  const max = Math.max(...data.map((d) => d.a + d.h + d.r), 1)

  return (
    <>
      <div className="mb-[7px] flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold">Match outcomes</h3>
          <div className="mt-px text-[12.5px] text-muted-foreground">Daily volume, last 30 days · 1,284 matches</div>
        </div>
        <div className="flex flex-wrap gap-[10px] text-[12px] text-secondary-foreground">
          {SEGMENTS.map((seg) => (
            <span key={seg.key}>
              <i className="mr-1 inline-block size-1.5 rounded-[2px]" style={{ background: seg.color }} />
              {seg.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex h-[108px] items-end gap-0.5 pt-0.5" aria-hidden="true">
        {data.map((d) => (
          <div
            key={d.d}
            data-bar-col
            title={`${d.d}: ${d.a} auto-approved, ${d.h} approved after review, ${d.r} rejected`}
            className="relative flex h-full min-w-0 flex-1 flex-col-reverse gap-0.5"
          >
            {SEGMENTS.map((seg) => (
              <div
                key={seg.key}
                className="w-full min-h-px rounded-[1px] transition-opacity hover:opacity-80"
                style={{ height: `${(d[seg.key] / max) * 100}%`, background: seg.color }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[12px] text-muted-foreground/70" aria-hidden="true">
        <span>Mar 1</span>
        <span>Mar 8</span>
        <span>Mar 15</span>
        <span>Mar 22</span>
        <span>Mar 30</span>
      </div>
      <Collapsible open={showData} onOpenChange={setShowData} className="mt-[7px] text-[12.5px] text-muted-foreground">
        <CollapsibleTrigger className="cursor-pointer select-none">View data table</CollapsibleTrigger>
        <CollapsibleContent>
          <table className="mt-1 w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b px-1 py-0.5 text-left text-[12px]">Day</th>
                <th className="border-b px-1 py-0.5 text-right text-[12px]">Auto</th>
                <th className="border-b px-1 py-0.5 text-right text-[12px]">After review</th>
                <th className="border-b px-1 py-0.5 text-right text-[12px]">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.d}>
                  <td className="border-b px-1 py-0.5 text-left text-[12px]">{d.d}</td>
                  <td className="border-b px-1 py-0.5 text-right text-[12px]">{d.a}</td>
                  <td className="border-b px-1 py-0.5 text-right text-[12px]">{d.h}</td>
                  <td className="border-b px-1 py-0.5 text-right text-[12px]">{d.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
