import { cn } from '@/lib/utils'

function SpineNode({ label, no, ok, sub }: { label: string; no: string | null; ok: boolean; sub: string }) {
  return (
    <div className={cn(
      'min-w-0 flex-1 rounded-md border px-2 py-1.5',
      ok ? 'border-success/25 bg-success-bg' : 'border-dashed border-warning/30 bg-warning-bg',
    )}>
      <div className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-semibold tabular-nums">{no ?? 'Missing'}</div>
      <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{sub}</div>
    </div>
  )
}

export function DocumentSpine({ invoice, po, grn }: { invoice: string; po: string | null; grn: string | null }) {
  return (
    <div className="flex flex-col items-stretch gap-1.5 sm:flex-row">
      <SpineNode label="Invoice" no={invoice} ok sub="S3 original · Pinecone vectors" />
      <span className={cn('hidden w-3.5 self-center border-t sm:block', po ? 'border-border' : 'border-dashed border-warning/50')} />
      <SpineNode label="Purchase order" no={po} ok={Boolean(po)} sub={po ? 'Matched by PO reference' : 'No PO reference'} />
      <span className={cn('hidden w-3.5 self-center border-t sm:block', grn ? 'border-border' : 'border-dashed border-warning/50')} />
      <SpineNode label="Goods receipt" no={grn} ok={Boolean(grn)} sub={grn ? 'Matched by PO + vendor' : 'No receipt found'} />
    </div>
  )
}
