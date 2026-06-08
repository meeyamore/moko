import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '../types'
import { USERS } from '../lib/data'

interface AuthState {
  user: User | null
  activeRole: Role | null
  displayCurrency: string
  login: (email: string, password: string) => boolean
  logout: () => void
  setDisplayCurrency: (currency: string) => void
}

const CREDENTIALS: Record<string, string> = {
  'ceo@voltrak.com': 'password',
  'manager@voltrak.com': 'password',
  'sitemanager@voltrak.com': 'password',
  'worker@voltrak.com': 'password',
  'bongani@voltrak.com': 'password',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      displayCurrency: 'USD',

      login: (email, password) => {
        const normalized = email.toLowerCase().trim()
        if (CREDENTIALS[normalized] === password) {
          const user = USERS.find(u => u.email === normalized)
          if (user) {
            set({ user, activeRole: user.role })
            return true
          }
        }
        return false
      },

      logout: () => set({ user: null, activeRole: null }),

      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    }),
    { name: 'voltrak-auth' }
  )
)
