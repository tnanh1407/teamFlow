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
      refetchOnWindowFocus: false,
      retry: 1,
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
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </>
  );
}

export default App;
