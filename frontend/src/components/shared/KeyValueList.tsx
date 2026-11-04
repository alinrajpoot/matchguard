import type { ReactNode } from 'react';

export function KeyValueList({ items, dtWidth = "86px" }: { items: [string, ReactNode][]; dtWidth?: string }) {
  return (
    <dl className="grid grid-cols-[var(--dt-width)_1fr] gap-x-2 gap-y-1 text-[13px]" style={{ "--dt-width": dtWidth } as React.CSSProperties}>
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
