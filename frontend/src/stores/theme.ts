import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "light" | "dark" | "system"

interface ThemeState {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
  toggleTheme: () => void
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"

  const storedTheme = window.localStorage.getItem("teamflow-theme")
  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") return storedTheme

  return "system"
}

export function resolveThemeMode(themeMode: ThemeMode, systemPrefersDark: boolean) {
  if (themeMode === "system") {
    return systemPrefersDark ? "dark" : "light"
  }

  return themeMode
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: getInitialTheme(),
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === "light" ? "dark" : state.themeMode === "dark" ? "system" : "light",
        })),
    }),
    {
      name: "teamflow-theme",
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
)
