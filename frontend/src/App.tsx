import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ProcessingWatcher } from '@/hooks/use-processing-watcher'
import { createQueryClient } from '@/lib/query-client'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import DocumentsPage from '@/features/documents/DocumentsPage'
import InvoicesPage from '@/features/invoices/InvoicesPage'
import RunsPage from '@/features/runs/RunsPage'
import QueuePage from '@/features/queue/QueuePage'
import ReviewPage from '@/features/review/ReviewPage'
import PoliciesPage from '@/features/policies/PoliciesPage'
import AuditPage from '@/features/audit/AuditPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import SettingsPage from '@/features/settings/SettingsPage'

export default function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ProcessingWatcher />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="runs" element={<RunsPage />} />
                <Route path="queue" element={<QueuePage />} />
                <Route path="review/:matchId" element={<ReviewPage />} />
                <Route path="policies" element={<PoliciesPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-center" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
