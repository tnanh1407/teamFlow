import { useEffect, useLayoutEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import router from "@/routes"
import { useAuthStore } from "@/stores/auth"
import { resolveThemeMode, useThemeStore } from "@/stores/theme"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // quay lại tab thì giữ data cũ, chỉ fetch khi bạn chủ động
      retry: 1, // nếu data lỗi thì  gọi lại 1 lần
    },
  },
})

function AuthBootstrapper() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth)

  useEffect(() => {
    void bootstrapAuth()
  }, [bootstrapAuth])

  return null
}

function AppContent() {
  const themeMode = useThemeStore((state) => state.themeMode)
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  )
  const resolvedTheme = resolveThemeMode(themeMode, systemPrefersDark)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet
        defaultTitle="Hệ thống quản lý phòng ban và dự án"
        titleTemplate="%s | Hệ thống quản lý phòng ban và dự án"
      />
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        theme={resolvedTheme}
        duration={2200}
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "rounded-2xl border border-border bg-background text-foreground shadow-lg shadow-black/5",
            description: "text-muted-foreground",
            closeButton: "text-muted-foreground hover:text-foreground",
            success: "border-l-4 border-l-[color:var(--success)]",
            error: "border-l-4 border-l-[color:var(--danger)]",
          },
        }}
      />
    </QueryClientProvider>
  )
}

function App() {
  return (
    <>
      <AuthBootstrapper />
      <AppContent />
    </>
  );
}

export default App;
