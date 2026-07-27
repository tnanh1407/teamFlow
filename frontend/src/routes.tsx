import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserDashboard from "@/pages/user/UserDashboard";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/admin/Dashboard";
import Members from "@/pages/user/Members";
import UserDetail from "@/pages/user/UserDetail";
import Departments from "@/pages/admin/Departments";
import Employees from "@/pages/admin/Employees";
import EmployeeDetail from "@/pages/admin/EmployeeDetail";
import DepartmentDetail from "@/pages/admin/DepartmentDetail";
import Positions from "@/pages/admin/Positions";
import Projects from "@/pages/user/Projects";
import Settings from "@/pages/user/Settings";
import NotFound from "@/pages/user/NotFound";
import ProjectDetail from "@/pages/user/ProjectDetail";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

const positionHome: Record<string, string> = {
  admin: "/dashboard",
};

function RoleRedirect({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const redirect = positionHome[user.position] || "/";
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
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
      { index: true, element: <RoleRedirect roles={["admin", "user"]}><UserDashboard /></RoleRedirect> },
      { path: "dashboard", element: <RoleRedirect roles={["admin"]}><Dashboard /></RoleRedirect> },
      { path: "members", element: <RoleRedirect roles={["admin", "user"]}><Members /></RoleRedirect> },
      { path: "members/:id", element: <RoleRedirect roles={["admin", "user"]}><UserDetail /></RoleRedirect> },
      { path: "departments", element: <RoleRedirect roles={["admin"]}><Departments /></RoleRedirect> },
      { path: "departments/:id", element: <RoleRedirect roles={["admin"]}><DepartmentDetail /></RoleRedirect> },
      { path: "employees", element: <RoleRedirect roles={["admin"]}><Employees /></RoleRedirect> },
      { path: "employees/:id", element: <RoleRedirect roles={["admin"]}><EmployeeDetail /></RoleRedirect> },
      { path: "positions", element: <RoleRedirect roles={["admin"]}><Positions /></RoleRedirect> },
      { path: "projects", element: <RoleRedirect roles={["admin", "user"]}><Projects /></RoleRedirect> },
      { path: "projects/:id", element: <RoleRedirect roles={["admin", "user"]}><ProjectDetail /></RoleRedirect> },
      { path: "settings", element: <RoleRedirect roles={["admin", "user"]}><Settings /></RoleRedirect> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export { positionHome };
export default router;
