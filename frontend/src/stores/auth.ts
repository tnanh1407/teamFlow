import { create } from "zustand"
import { devtools } from "zustand/middleware"
import userService, { type User } from "@/services/user.service"

type SetUserAction = User | null | ((current: User | null) => User | null)

interface AuthState {
  user: User | null
  ready: boolean // sẵn sàng => nghĩa là chưa bootrapAuth xong thì ready vẫn là true
  setUser: (value: SetUserAction) => void
  bootstrapAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      ready: false,
      setUser: (value) =>
        set(
          (state) => ({
            user: typeof value === "function" ? value(state.user) : value,
          }),
          false,
          "auth/setUser"
        ),
      bootstrapAuth: async () => {
        if (get().ready) return

        try {
          const { data } = await userService.me()
          set({ user: data.data }, false, "auth/bootstrapAuth:success")
        } catch {
          set({ user: null }, false, "auth/bootstrapAuth:error")
        } finally {
          set({ ready: true }, false, "auth/bootstrapAuth:done")
        }
      },
      logout: async () => {
        try {
          await userService.logout()
        } catch {
          // ignore logout errors and clear local state anyway
        } finally {
          set({ user: null }, false, "auth/logout")
        }
      },
    }),
    {
      name: "AuthStore",
      enabled: import.meta.env.DEV,
    }
  )
)

export function useAuth() {
  return useAuthStore()
}
