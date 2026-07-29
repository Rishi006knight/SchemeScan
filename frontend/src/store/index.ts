import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileData } from '@/lib/api'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: { id: number; username: string; email: string } | null
  profile: ProfileData | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (user: AuthState['user']) => void
  setProfile: (profile: ProfileData) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      profile: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      setProfile: (profile) => set({ profile }),

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ accessToken: null, refreshToken: null, user: null, profile: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ── UI Store (chatbot, theme) ─────────────────────────────────────────────────
interface UIState {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  toggleChat: () => void
}

export const useUIStore = create<UIState>((set) => ({
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
}))
