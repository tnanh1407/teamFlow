import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import UserDetail from "@/pages/UserDetail";
import Departments from "@/pages/Departments";
import Employees from "@/pages/Employees";
import Positions from "@/pages/Positions";
import Tasks from "@/pages/Tasks";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "members", element: <Members /> },
      { path: "members/:id", element: <UserDetail /> },
      { path: "departments", element: <Departments /> },
      { path: "employees", element: <Employees /> },
      { path: "positions", element: <Positions /> },
      { path: "tasks", element: <Tasks /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
