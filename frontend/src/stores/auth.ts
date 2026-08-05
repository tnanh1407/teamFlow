import { create } from "zustand"
import userService, { type User } from "@/services/user.service"

type SetUserAction = User | null | ((current: User | null) => User | null)

interface AuthState {
  user: User | null
  ready: boolean
  bootstrapping: boolean
  setUser: (value: SetUserAction) => void
  bootstrapAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  bootstrapping: false,
  setUser: (value) =>
    set((state) => ({
      user: typeof value === "function" ? value(state.user) : value,
    })),
  bootstrapAuth: async () => {
    const { ready, bootstrapping } = get()
    if (ready || bootstrapping) return

    set({ bootstrapping: true })

    try {
      const { data } = await userService.me()
      set({ user: data.data })
    } catch {
      set({ user: null })
    } finally {
      set({ ready: true, bootstrapping: false })
    }
  },
  logout: async () => {
    try {
      await userService.logout()
    } catch {
      // ignore logout errors and clear local state anyway
    } finally {
      set({ user: null })
    }
  },
}))

export function useAuth() {
  return useAuthStore()
}
