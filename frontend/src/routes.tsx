import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import Settings from "@/pages/Settings";
import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "members",
        element: <Members />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export default router;
