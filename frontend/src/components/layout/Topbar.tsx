import { Bell, LogOut, Menu, Settings, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { useNotifications } from '@/hooks/queries'
import { titleForPath } from '@/lib/constants'
import { useAssistantStore } from '@/stores/assistant-store'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const toggleAssistant = useUiStore((s) => s.toggleAssistant)
  const signOut = useAuthStore((s) => s.signOut)
  const { data: notifications } = useNotifications()
  const unread = notifications?.filter((n) => n.unread).length ?? 0

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-card/95 px-3.5 backdrop-blur">
      <Button variant="ghost" size="iconSm" className="min-[1024px]:hidden" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
        <Menu />
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-semibold">{titleForPath(location.pathname)}</h2>
        <Badge variant="info" className="hidden min-[900px]:inline-flex">Demo data</Badge>
      </div>
      <div className="flex-1" />
      <div className="hidden min-[900px]:block"><GlobalSearch /></div>
      <Button
        className="bg-gradient-to-b from-[#5850ec] to-primary text-white hover:bg-primary/90"
        size="xs"
        aria-label="Assistant"
        onClick={toggleAssistant}
      >
        <Sparkles /> <span className="hidden min-[640px]:inline">Assistant</span>
      </Button>
      <Button asChild variant="ghost" size="iconSm" className="relative" aria-label="Notifications">
        <Link to="/notifications">
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-card bg-danger text-[8.5px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
      </Button>
      <Button asChild variant="ghost" size="iconSm" aria-label="Settings">
        <Link to="/settings"><Settings /></Link>
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          signOut()
          useAssistantStore.getState().reset()
          navigate('/login')
        }}
      >
        <LogOut /> <span className="hidden min-[640px]:inline">Log out</span>
      </Button>
    </header>
  )
}
