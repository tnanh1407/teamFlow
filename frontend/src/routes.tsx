import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/features/auth/Login";
import ForgotPassword from "@/features/auth/ForgotPassword";
import UserList from "@/features/user/UserList";
import UserDetail from "@/features/user/UserDetail";
import EmployeeList from "@/features/employee/EmployeeList";
import EmployeeDetail from "@/features/employee/EmployeeDetail";
import PositionList from "@/features/position/PositionList";
import ProjectList from "@/features/project/ProjectList";
import Settings from "@/features/user/Settings";
import NotFound from "@/features/user/NotFound";
import ProjectDetail from "@/features/project/ProjectDetail";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import DepartmentList from "./features/department/DepartmentList/DepartmentList";
import DepartmentDetail from "./features/department/DepartmentDetail/DepartmentDetail";
import UserDashboard from "./features/dashboard/AdminDashboard/UserDashboard/UserDashboard";
import AdminDashboard from "./features/dashboard/AdminDashboard/AdminDashboard";

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
      { path: "dashboard", element: <RoleRedirect roles={["admin"]}><AdminDashboard /></RoleRedirect> },
      { path: "members", element: <RoleRedirect roles={["admin", "user"]}><UserList /></RoleRedirect> },
      { path: "members/:id", element: <RoleRedirect roles={["admin", "user"]}><UserDetail /></RoleRedirect> },
      { path: "departments", element: <RoleRedirect roles={["admin"]}><DepartmentList /></RoleRedirect> },
      { path: "departments/:id", element: <RoleRedirect roles={["admin"]}><DepartmentDetail /></RoleRedirect> },
      { path: "employees", element: <RoleRedirect roles={["admin"]}><EmployeeList /></RoleRedirect> },
      { path: "employees/:id", element: <RoleRedirect roles={["admin"]}><EmployeeDetail /></RoleRedirect> },
      { path: "positions", element: <RoleRedirect roles={["admin"]}><PositionList /></RoleRedirect> },
      { path: "projects", element: <RoleRedirect roles={["admin", "user"]}><ProjectList /></RoleRedirect> },
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