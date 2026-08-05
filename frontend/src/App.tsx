import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
      </QueryClientProvider>
    </>
  );
}

export default App;
