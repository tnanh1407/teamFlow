import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
const Login = lazy(() => import("@/features/auth/Login"));
const ForgotPassword = lazy(() => import("@/features/auth/ForgotPassword"));
const UserList = lazy(() => import("@/features/user/UserList/UserList"));
const UserDetail = lazy(() => import("@/features/user/UserDetail"));
const PositionList = lazy(() => import("@/features/position/PositionList"));
const ProjectList = lazy(() => import("@/features/project/ProjectList"));
const Settings = lazy(() => import("@/features/user/Settings"));
import NotFound from "@/features/user/NotFound";
const ProjectDetail = lazy(() => import("@/features/project/ProjectDetail"));
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
const DepartmentList = lazy(() => import("./features/department/DepartmentList/DepartmentList"));
const DepartmentDetail = lazy(() => import("./features/department/DepartmentDetail/DepartmentDetail"));
const AdminDashboard = lazy(() => import("./features/dashboard/AdminDashboard/AdminDashboard"));
const UserDashboard = lazy(() => import("./features/dashboard/UserDashboard/UserDashboard"));

const positionHome: Record<string, string> = {
  admin: "/dashboard",
};

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-zinc-500">Đang tải...</p>
    </div>
  )
}

function RoleRedirect({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Đang tải...</p>
      </div>
    );
  }
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
    element: <Suspense fallback={<RouteFallback />}><Login /></Suspense>,
  },
  {
    path: "forgot-password",
    element: <Suspense fallback={<RouteFallback />}><ForgotPassword /></Suspense>,
  },
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserDashboard /></Suspense></RoleRedirect> },
      { path: "dashboard", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><AdminDashboard /></Suspense></RoleRedirect> },
      { path: "users", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserList /></Suspense></RoleRedirect> },
      { path: "users/:id", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserDetail /></Suspense></RoleRedirect> },
      { path: "departments", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><DepartmentList /></Suspense></RoleRedirect> },
      { path: "departments/:id", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><DepartmentDetail /></Suspense></RoleRedirect> },
      { path: "positions", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><PositionList /></Suspense></RoleRedirect> },
      { path: "projects", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><ProjectList /></Suspense></RoleRedirect> },
      { path: "projects/:id", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><ProjectDetail /></Suspense></RoleRedirect> },
      { path: "settings", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><Settings /></Suspense></RoleRedirect> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export { positionHome };
export default router;
