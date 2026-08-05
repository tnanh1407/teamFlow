import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import { Toaster } from "sonner";
import router from "@/routes";

function App() {
  return (
    <AuthProvider>
      <Helmet
        defaultTitle="Hệ thống quản lý phòng ban và dự án"
        titleTemplate="%s | Hệ thống quản lý phòng ban và dự án"
      />
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}

export default App;
