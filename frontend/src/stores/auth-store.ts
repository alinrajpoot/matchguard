import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DemoUser } from '@/schemas/domain'
import { seedUser } from '@/mock/seed'

interface AuthState {
  user: DemoUser | null
  signIn: (email: string) => void
  signOut: () => void
  updateUser: (user: DemoUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (email) => set({ user: { ...seedUser, email } }),
      signOut: () => set({ user: null }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'matchguard.demo.session' },
  ),
)
