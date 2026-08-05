import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Toaster } from "sonner"
import router from "@/routes"
import { useAuthStore } from "@/stores/auth"

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
      <Helmet
        defaultTitle="Hệ thống quản lý phòng ban và dự án"
        titleTemplate="%s | Hệ thống quản lý phòng ban và dự án"
      />
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export default App;
