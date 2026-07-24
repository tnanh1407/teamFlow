import { RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import router from "@/routes";

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 6,
          colorPrimary: "#18181b",
          colorLink: "#18181b",
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#f4f4f5",
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
