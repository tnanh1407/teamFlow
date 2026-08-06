import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import router from "@/routes"
import { useAuthStore } from "@/stores/auth"

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

function App() {
  return (
    <>
      <AuthBootstrapper />
      <QueryClientProvider client={queryClient}>
        <Helmet
          defaultTitle="Hệ thống quản lý phòng ban và dự án"
          titleTemplate="%s | Hệ thống quản lý phòng ban và dự án"
        />
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          theme="system"
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
    </>
  );
}

export default App;
