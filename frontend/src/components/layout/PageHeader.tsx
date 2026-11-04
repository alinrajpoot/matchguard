import type { ReactNode } from 'react'
import { InfraChip } from '@/components/shared/InfraChip'

export function PageHeader({ title, subtitle, chips = [], actions }: {
  title: string
  subtitle: string
  chips?: string[]
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[24px] font-bold leading-[1.15] tracking-[-0.03em]">{title}</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {chips.map((chip) => <InfraChip key={chip} service={chip} />)}
        {actions}
      </div>
    </div>
  )
}
