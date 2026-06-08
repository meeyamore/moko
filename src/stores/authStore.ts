import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  displayCurrency: string
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setDisplayCurrency: (currency: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      displayCurrency: 'USD',

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        })
        if (error) return error.message
        if (data.user) await get().loadUser()
        return null
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      loadUser: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) { set({ user: null, loading: false }); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          set({
            user: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              avatar: profile.avatar || profile.name.substring(0, 2).toUpperCase(),
            },
            loading: false,
          })
        } else {
          set({ loading: false })
        }
      },

      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    }),
    { name: 'moko-auth', partialize: (s) => ({ displayCurrency: s.displayCurrency }) }
  )
)
