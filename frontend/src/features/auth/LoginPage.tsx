import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { seedUser } from '@/mock/seed'
import { useAuthStore } from '@/stores/auth-store'

export default function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn)
  const navigate = useNavigate()
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Button onClick={() => { signIn(seedUser.email); navigate('/dashboard') }}>Sign in to MatchGuard</Button>
    </div>
  )
}
