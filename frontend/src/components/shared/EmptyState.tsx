import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-8 text-center text-[11.5px] text-muted-foreground">
      {icon ?? <CheckCircle2 className="size-6 text-muted-foreground/60" />}
      <div>{title}</div>
      {hint && <div className="text-[10px]">{hint}</div>}
    </div>
  )
}
