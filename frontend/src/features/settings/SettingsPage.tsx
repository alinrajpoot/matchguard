import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { InfraChip } from '@/components/shared/InfraChip'
import { KeyValueList } from '@/components/shared/KeyValueList'
import { LoadingState } from '@/components/shared/LoadingState'
import { useUpdatePreferences, useUpdateProfile, useResetDemo } from '@/hooks/mutations'
import { useMe } from '@/hooks/queries'
import { db } from '@/mock/db'
import { profileSchema, type ProfileValues } from '@/schemas/forms'
import type { DemoUser, Preferences } from '@/schemas/domain'
import { useAssistantStore } from '@/stores/assistant-store'
import { useAuthStore } from '@/stores/auth-store'

const CARD = 'rounded-lg border bg-card'
const CARD_HEAD = 'flex items-center justify-between gap-2 border-b px-3 py-2'
const CARD_TITLE = 'text-[12.5px] font-semibold'
const MINI_ROW = 'flex items-center justify-between gap-2 border-b py-1.5 text-[11px] last:border-0'

const TIME_ZONES = ['Central Time (US)', 'Eastern Time (US)', 'Pacific Time (US)', 'UTC']

const ALERT_PREFERENCES: { key: keyof Preferences; title: string; sub: string }[] = [
  { key: 'escalation', title: 'New escalation in my queue', sub: 'Notify me when a match needs a decision' },
  { key: 'slaWarning', title: 'SLA under 1 hour', sub: 'Warn before a review breaches its SLA' },
  { key: 'weeklyDigest', title: 'Weekly digest', sub: 'Email a summary every Monday' },
]

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useMe()

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return <SettingsView me={data} />
}

function SettingsView({ me }: { me: DemoUser }) {
  const navigate = useNavigate()
  const saveProfile = useUpdateProfile()
  const updatePreferences = useUpdatePreferences()
  const resetDemo = useResetDemo()
  const signOut = useAuthStore((state) => state.signOut)
  const [preferences, setPreferences] = useState<Preferences>(me.preferences)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: me.name, email: me.email, tz: me.tz },
  })

  const onSaveProfile = form.handleSubmit((values) => {
    saveProfile.mutate(values, {
      onSuccess: (user) => {
        useAuthStore.getState().updateUser(user)
        form.reset({ name: user.name, email: user.email, tz: user.tz })
        toast('Profile saved.')
      },
      onError: (error) => toast(error.message),
    })
  })

  const togglePreference = (key: keyof Preferences, checked: boolean) => {
    const previous = preferences
    const next = { ...preferences, [key]: checked }
    setPreferences(next)
    updatePreferences.mutate(next, {
      onSuccess: () => toast('Alert preference saved.'),
      onError: (error) => {
        setPreferences(previous)
        toast(error.message)
      },
    })
  }

  const onReset = () => {
    resetDemo.mutate(undefined, {
      onSuccess: () => {
        useAssistantStore.getState().reset()
        toast('Demo data reset to the seeded state.')
        navigate('/dashboard')
      },
      onError: (error) => toast(error.message),
    })
  }

  const onSignOut = () => {
    signOut()
    useAssistantStore.getState().reset()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Profile, alert preferences and the demo deployment."
        chips={['docker', 'ecr', 'github', 'ec2']}
      />

      <div className="grid grid-cols-2 items-start gap-[9px] max-[900px]:grid-cols-1">
        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={CARD_TITLE}>Profile</h3>
            <Badge variant="neutral">Single user</Badge>
          </div>
          <div className="p-3">
            <div className="mb-[7px]">
              <Label
                htmlFor="settings-name"
                className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
              >
                Name
              </Label>
              <Input id="settings-name" className="h-7 text-[11px]" {...form.register('name')} />
            </div>
            <div className="mb-[7px]">
              <Label
                htmlFor="settings-email"
                className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
              >
                Email
              </Label>
              <Input id="settings-email" type="email" className="h-7 text-[11px]" {...form.register('email')} />
            </div>
            <div>
              <Label
                htmlFor="settings-tz"
                className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
              >
                Time zone
              </Label>
              <select
                id="settings-tz"
                className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-[11px] shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                {...form.register('tz')}
              >
                {TIME_ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
            </div>
            <Button
              size="xs"
              className="mt-[9px]"
              disabled={saveProfile.isPending}
              onClick={onSaveProfile}
            >
              Save changes
            </Button>
          </div>
        </div>

        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={CARD_TITLE}>Alert preferences</h3>
          </div>
          <div className="px-3 py-1">
            {ALERT_PREFERENCES.map((preference) => (
              <div
                key={preference.key}
                className="flex items-center justify-between gap-[10px] border-b py-[7px] text-[11.5px] last:border-0"
              >
                <div>
                  <div>{preference.title}</div>
                  <div className="mt-px text-[9.5px] text-muted-foreground">{preference.sub}</div>
                </div>
                <Switch
                  aria-label={preference.title}
                  checked={preferences[preference.key]}
                  onCheckedChange={(checked) => togglePreference(preference.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={CARD_TITLE}>Demo environment</h3>
            <Badge variant="info">Fictional data</Badge>
          </div>
          <div className="p-3">
            <KeyValueList
              items={[
                ['Workspace', 'Northgate Industrial Supply'],
                ['User', me.name],
                ['Mode', 'Single-user demo'],
                ['Data', `${db.documents.length} documents · ${db.invoices.filter((invoice) => !invoice.hidden).length} invoices · ${db.runs.length} runs`],
              ]}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  className="mt-[9px] border-danger/40 text-danger hover:bg-danger-bg hover:text-danger"
                >
                  <RefreshCw />Reset demo data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This restores documents, invoices, runs, queue, policy and preferences to the seeded
                    demo state. It cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className={CARD}>
          <div className={CARD_HEAD}>
            <h3 className={CARD_TITLE}>Deployment</h3>
            <Badge variant="success">Healthy</Badge>
          </div>
          <div className="px-3 py-2">
            <div className={MINI_ROW}>
              <span>Image</span>
              <span className="mono text-[10px]">matchguard-api:1.4.2</span>
            </div>
            <div className={MINI_ROW}>
              <span>Registry</span>
              <InfraChip service="ecr" resource="matchguard-api:1.4.2 · sha 7f3a91c" label="ECR" />
            </div>
            <div className={MINI_ROW}>
              <span>Host</span>
              <InfraChip service="ec2" resource="i-0a73c9e4f1 · m7g.large" label="EC2" />
            </div>
            <div className={MINI_ROW}>
              <span>Pipeline</span>
              <InfraChip service="github" resource="deploy.yml · run #218" label="Actions" />
            </div>
            <div className={MINI_ROW}>
              <span>Stack</span>
              <InfraChip service="docker" resource="infra/docker-compose.yaml" label="Compose" />
            </div>
          </div>
        </div>

        <div className={`${CARD} col-span-2 max-[900px]:col-span-1`}>
          <div className="flex items-center justify-between gap-[10px] p-3">
            <div>
              <div className="font-semibold">Sign out of MatchGuard</div>
              <div className="text-[10px] text-muted-foreground">Returns to the demo sign-in screen.</div>
            </div>
            <Button variant="outline" size="xs" onClick={onSignOut}>
              <LogOut />Log out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
