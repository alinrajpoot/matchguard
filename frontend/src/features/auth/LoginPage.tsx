import { zodResolver } from '@hookform/resolvers/zod'
import { GitCompare, ScrollText, ShieldCheck, UserCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { seedUser } from '@/mock/seed'
import { loginSchema, type LoginValues } from '@/schemas/forms'
import { useAuthStore } from '@/stores/auth-store'

const PROOF_POINTS = [
  { icon: GitCompare, text: 'Three-way matching with cited evidence on every line' },
  { icon: UserCheck, text: 'You approve every exception — no silent automation of money' },
  { icon: ScrollText, text: 'Append-only audit trail, retained for 7 years' },
]

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const signIn = useAuthStore((s) => s.signIn)
  const navigate = useNavigate()
  const location = useLocation()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: seedUser.email, password: 'demopassword' },
  })

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = (values: LoginValues) => {
    signIn(values.email)
    toast(`Welcome back, ${seedUser.name.split(' ')[0]}.`)
    const from = (location.state as { from?: string } | null)?.from
    navigate(from || '/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-background">
      <section className="hidden w-[46%] min-w-[380px] flex-col justify-between bg-[radial-gradient(760px_460px_at_12%_0,#3730a3_0,#0f172a_64%)] p-10 text-white min-[900px]:flex">
        <div className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em]">
          <ShieldCheck className="size-6" />
          <span>MatchGuard</span>
        </div>
        <div>
          <h1 className="mt-7 max-w-[430px] text-[32px] leading-[1.1] tracking-[-0.03em]">
            Every payment, matched and accounted.
          </h1>
          <div className="mt-[26px] grid max-w-[370px] gap-3 text-[13px] text-slate-300">
            {PROOF_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-[9px]">
                <Icon className="mt-px size-4 shrink-0 text-indigo-300" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          SOC 2 Type II · Demo environment, all data is fictional
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          <div className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em]">
            <ShieldCheck className="size-6 text-primary" />
            <span>MatchGuard</span>
          </div>
          <h2 className="mt-[22px] text-[22px] tracking-[-0.02em]">Sign in</h2>
          <p className="mb-[22px] mt-[3px] text-muted-foreground">to Northgate Industrial Supply</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-3 gap-1.5">
                    <FormLabel className="text-[11px] font-semibold text-secondary-foreground">Work email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-3 gap-1.5">
                    <FormLabel className="text-[11px] font-semibold text-secondary-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-[18px] w-full">Sign in</Button>
            </form>
          </Form>
          <p className="mt-[14px] text-[11px] text-muted-foreground">
            Demo credentials are prefilled. All data is fictional.
          </p>
        </div>
      </section>
    </div>
  )
}
