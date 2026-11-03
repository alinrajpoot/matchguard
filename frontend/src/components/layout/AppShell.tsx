import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { InfraDialog } from '@/components/shared/InfraDialog'

export function AppShell() {
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
    </div>
  )
}
