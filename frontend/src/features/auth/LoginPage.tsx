import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { seedUser } from '@/mock/seed'
import { loginSchema, type LoginValues } from '@/schemas/forms'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { GitCompare, ScrollText, UserCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
      <section className="relative hidden w-[46%] min-w-[400px] flex-col justify-center overflow-hidden bg-[radial-gradient(900px_620px_at_18%_-10%,#005dfc_0%,#0446b4_40%,#01173e_100%)] p-12 text-white min-[900px]:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:100%_36px]"
        />
        {/* <div className="relative flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.02em]">
          <ShieldCheck className="size-6 text-[#7cb2ff]" />
          <span>Match<span className="text-[#7cb2ff]">Guard</span></span>
        </div> */}
        <div className="relative">
          <h1 className="max-w-[480px] text-[36px] font-bold leading-[1.16] tracking-[-0.035em]">
            Every payment,
            <br />
            matched and accounted.
          </h1>
          <p className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-[#fff]">
            Three-way matching that shows its work — with the evidence, policy and audit trail attached.
          </p>
          <div className="mt-8 grid max-w-[400px] gap-3.5 text-[14px] text-[#fff]">
            {PROOF_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-[18px] shrink-0 text-[#7cb2ff]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-20 flex items-center gap-3 text-[12px] text-[#9db4d4]">
          <span className="rounded border border-white/20 px-2 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#c3d5f2]">
            Designed to support SOC 2 audit requirements
          </span>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 max-[640px]:p-5">
        <div className="w-full max-w-[380px]">
          <img src="/logo.png" alt="MatchGuard" className="h-20 w-auto -ml-2" />
          <h2 className="mt-5 text-[28px] font-bold leading-tight tracking-[-0.03em]">Sign in</h2>
          <p className="mb-7 mt-1 text-[14px] text-muted-foreground">to Northgate Industrial Supply</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-4 gap-1.5">
                    <FormLabel className="text-[13px] font-semibold text-secondary-foreground">Work email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-4 gap-1.5">
                    <FormLabel className="text-[13px] font-semibold text-secondary-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-6 h-10 w-full">Sign in</Button>
            </form>
          </Form>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Demo credentials are prefilled. All data is fictional.
          </p>
        </div>
      </section>
    </div>
  )
}
