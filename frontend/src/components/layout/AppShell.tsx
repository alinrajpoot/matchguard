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
      <div className="min-[1024px]:pl-[216px]">
        <Topbar />
        <main className="mx-auto max-w-[1660px] px-5 pb-11 pt-4 max-[1200px]:px-4 max-[640px]:px-2.5">
          <Outlet />
        </main>
      </div>
      <InfraDialog />
      <AssistantDrawer />
    </div>
  )
}
