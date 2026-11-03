import type { ReactNode } from 'react'
import { InfraChip } from '@/components/shared/InfraChip'

export function PageHeader({ title, subtitle, chips = [], actions }: {
  title: string
  subtitle: string
  chips?: string[]
  actions?: ReactNode
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[19px] font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {chips.map((chip) => <InfraChip key={chip} service={chip} />)}
        {actions}
      </div>
    </div>
  )
}
