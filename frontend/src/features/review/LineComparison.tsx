import { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LineItem } from '@/schemas/domain'

const GRID = 'grid grid-cols-[1.5fr_1fr_1fr_1.15fr_82px_26px] items-center [&>div]:px-2.5 [&>div]:py-[7px]'

const HEADINGS = ['Line item', 'Purchase order', 'Goods receipt', 'Vendor invoice', 'Conf.', '']

function signedMoney(value: number) {
  return value >= 0 ? `+${money(value)}` : money(value)
}

function signedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function LineComparison({ invoice, lines }: { invoice: string; lines: LineItem[] }) {
  const [open, setOpen] = useState<number[]>([0])

  const toggle = (index: number) => setOpen((current) => (
    current.includes(index) ? current.filter((entry) => entry !== index) : [...current, index]
  ))

  const totalPo = lines.reduce((sum, line) => sum + line.poQty * line.poPrice, 0)
  const totalDelta = lines.reduce((sum, line) => sum + (line.invPrice - line.poPrice) * line.invQty, 0)
  const totalPercent = totalPo ? (totalDelta / totalPo) * 100 : 0

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className={GRID}>
          {HEADINGS.map((heading) => (
            <div
              key={heading || 'chevron'}
              className="border-b bg-muted/40 text-[9px] font-semibold uppercase tracking-[0.055em] text-muted-foreground last:border-0"
            >
              {heading}
            </div>
          ))}
        </div>

        {lines.map((line, index) => {
          const variance = ((line.invPrice - line.poPrice) / line.poPrice) * 100
          const delta = (line.invPrice - line.poPrice) * line.invQty
          return (
            <div key={line.sku} className={cn('border-b last:border-0', line.flag && 'bg-[#fffcf5]')}>
              <div className={GRID}>
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    {line.flag && <AlertTriangle className="size-3.5 shrink-0 text-warning" />}
                    {line.sku}
                  </div>
                  <div className="mt-px text-[10px] text-muted-foreground">{line.desc}</div>
                </div>

                <div className="tabular-nums">
                  <div className="text-[11px]">{line.poQty} × {money(line.poPrice)}</div>
                  <div className="text-[10.5px] font-semibold">{money(line.poQty * line.poPrice)}</div>
                </div>

                <div className="tabular-nums">
                  <div className="text-[11px]">{line.grnQty} × {money(line.poPrice)}</div>
                  <div className="text-[10.5px] font-semibold">{money(line.grnQty * line.poPrice)}</div>
                </div>

                <div className="tabular-nums">
                  <div className="text-[11px]">{line.invQty} × {money(line.invPrice)}</div>
                  <div className="text-[10.5px] font-semibold">{money(line.invQty * line.invPrice)}</div>
                  {line.flag && (
                    <div className="mt-px flex flex-wrap gap-1">
                      <Badge variant="warning">{signedPercent(variance)}</Badge>
                      <Badge variant="danger">{signedMoney(delta)}</Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Badge variant="neutral" className="tabular-nums">{line.conf}%</Badge>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label="Toggle evidence"
                    onClick={() => toggle(index)}
                  >
                    <ChevronDown className={cn('transition-transform', open.includes(index) && 'rotate-180')} />
                  </Button>
                </div>
              </div>

              {open.includes(index) && (
                <div className="border-t bg-muted/40 px-2.5 py-1.5 text-[10px] text-muted-foreground">
                  <b>Evidence</b> ·{' '}
                  <code className="rounded border bg-card px-1 font-mono text-[9.5px]">invoice_{invoice}.pdf</code>
                  {' '}p.{index < 1 ? 2 : 1} · Pinecone chunk {index + 3}/8 · Nova Lite confidence{' '}
                  {(line.conf / 100).toFixed(2)}
                  {line.flag && (
                    <div className="mt-[3px] italic">
                      {`"${line.sku} … ${line.invQty} EA … ${line.invPrice.toFixed(2)} … ${money(line.invQty * line.invPrice)}"`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex items-center justify-between border-t px-2.5 py-2 text-[11px] font-semibold">
          <span>Total variance</span>
          <Badge variant={totalDelta > 0 ? 'danger' : 'success'}>
            {signedMoney(totalDelta)} · {signedPercent(totalPercent)}
          </Badge>
        </div>
      </div>
    </div>
  )
}
