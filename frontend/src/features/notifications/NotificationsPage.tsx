import { CheckCheck, Clock, FileWarning, Rocket, ShieldAlert, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/mutations'
import { useNotifications } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/schemas/domain'

const ICONS: Record<string, LucideIcon> = {
  'shield-alert': ShieldAlert,
  clock: Clock,
  'sliders-horizontal': SlidersHorizontal,
  'file-warning': FileWarning,
  'check-circle-2': CheckCheck,
  rocket: Rocket,
}

const TONE_TILE: Record<NotificationItem['tone'], string> = {
  bad: 'bg-danger-bg text-danger',
  warn: 'bg-warning-bg text-warning',
  ok: 'bg-success-bg text-success',
  acc: 'bg-accent text-accent-foreground',
  info: 'bg-info-bg text-info',
}

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const navigate = useNavigate()

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const unread = data.filter((notification) => notification.unread).length

  const open = (notification: NotificationItem) => {
    markRead.mutate(notification.id, {
      onSuccess: () => {
        if (notification.target === 'review' && notification.match) {
          navigate(`/review/${notification.match}`)
        } else {
          navigate(`/${notification.target}`)
        }
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Escalations, SLA warnings, document failures and deployment events."
        chips={['fastapi', 'postgres']}
        actions={(
          <Button
            variant="outline"
            size="xs"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => markAll.mutate(undefined, {
              onSuccess: () => toast('All notifications marked read.'),
            })}
          >
            <CheckCheck />Mark all read
          </Button>
        )}
      />

      <div className="max-w-[900px] overflow-hidden rounded-lg border bg-card">
        {data.length === 0 && <EmptyState title="No notifications." />}
        {data.map((notification) => {
          const Icon = ICONS[notification.icon] ?? Clock
          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => open(notification)}
              className="flex w-full gap-3 border-b bg-card px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50"
            >
              <span className={cn('flex size-[30px] flex-none items-center justify-center rounded-[7px]', TONE_TILE[notification.tone])}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{notification.title}</span>
                <span className="mt-px block whitespace-normal text-[13px] text-muted-foreground">
                  {notification.body}
                </span>
              </span>
              <span className="whitespace-nowrap text-[12px] text-muted-foreground/70">
                {notification.time}
              </span>
              <span
                className={cn(
                  'mt-[5px] size-1.5 flex-none rounded-full bg-primary',
                  !notification.unread && 'invisible',
                )}
              />
            </button>
          )
        })}
      </div>
    </>
  )
}
