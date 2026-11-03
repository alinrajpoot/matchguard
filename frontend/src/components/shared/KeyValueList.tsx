import type { ReactNode } from 'react'

export function KeyValueList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[86px_1fr] gap-x-2 gap-y-1 text-[10.5px]">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
