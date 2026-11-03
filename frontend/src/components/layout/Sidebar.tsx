import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useQueue } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import { seedNav, seedTitles } from '@/mock/seed'
import { useUiStore } from '@/stores/ui-store'
import { Files, GitCompare, LayoutDashboard, ReceiptText, ScrollText, SlidersHorizontal, UserCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard, documents: Files, invoices: ReceiptText,
  runs: GitCompare, queue: UserCheck, policies: SlidersHorizontal, audit: ScrollText,
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { data: queue } = useQueue()
  const openInfra = useUiStore((s) => s.openInfra)

  return (
    <>
      <div className="flex h-12 items-center gap-2 border-b px-3.5">
        <img src="/logo.png" alt="MatchGuard" className="h-10" />
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2 py-2">
        {seedNav.map((item, index) => {
          const heading = item.group !== seedNav[index - 1]?.group ? item.group : null
          const Icon = NAV_ICONS[item.id] ?? LayoutDashboard
          const active = location.pathname.startsWith(`/${item.id}`)
            || (item.id === 'queue' && location.pathname.startsWith('/review'))
          const count = item.id === 'queue' ? queue?.length ?? 0 : 0
          return (
            <div key={item.id}>
              {heading && (
                <div className="px-2 pb-1 pt-3 text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
                  {heading}
                </div>
              )}
              <Link
                to={`/${item.id}`}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                title={seedTitles[item.id]}
                className={cn(
                  'relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                  active && 'bg-accent text-accent-foreground',
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {count > 0 && <Badge variant="danger" className="ml-auto">{count}</Badge>}
              </Link>
            </div>
          )
        })}
      </nav>
      <div className="border-t px-3 py-2.5">
        <div className="text-[11.5px] font-semibold">Northgate Industrial Supply</div>
        <div className="mt-0.5 text-[10.5px] text-muted-foreground">Demo environment · single user</div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary"
          onClick={() => openInfra('ec2', 'i-0a73c9e4f1 · us-east-1')}
        >
          <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          All systems operational
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen)
  const setOpen = useUiStore((s) => s.setSidebarOpen)
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[216px] flex-col border-r bg-card min-[1024px]:flex">
        <SidebarContent />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[216px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col"><SidebarContent onNavigate={() => setOpen(false)} /></div>
        </SheetContent>
      </Sheet>
    </>
  )
}
