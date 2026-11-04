import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AssistantDrawer } from '@/components/assistant/AssistantDrawer'
import { InfraDialog } from '@/components/shared/InfraDialog'
import { titleForPath } from '@/lib/constants'
import { useAssistantStore } from '@/stores/assistant-store'

export function AppShell() {
  const setContext = useAssistantStore((state) => state.setContext)
  const location = useLocation()

  useEffect(() => {
    setContext(titleForPath(location.pathname))
  }, [location.pathname, setContext])

  return (
    <div className="min-h-svh">
      <Sidebar />
      <div className="min-[1024px]:pl-[240px]">
        <Topbar />
        <main className="mx-auto max-w-[1680px] px-6 pb-12 pt-6 max-[1200px]:px-5 max-[640px]:px-3 max-[640px]:pt-4">
          <Outlet />
        </main>
      </div>
      <InfraDialog />
      <AssistantDrawer />
    </div>
  )
}
