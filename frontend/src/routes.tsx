import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/features/auth/Login";
import ForgotPassword from "@/features/auth/ForgotPassword";
const UserList = lazy(() => import("@/features/user/UserList/UserList"));
const UserTrash = lazy(() => import("@/features/user/UserTrash/UserTrash"));
const PasswordResetRequests = lazy(() => import("@/features/user/PasswordResetRequests/PasswordResetRequests"));
const UserDetail = lazy(() => import("@/features/user/UserDetail/UserDetail"));
const PositionList = lazy(() => import("@/features/position/PositionList"));
const ProjectList = lazy(() => import("@/features/project/ProjectList"));
const Settings = lazy(() => import("@/features/user/Settings"));
import NotFound from "@/features/user/NotFound";
const ProjectDetail = lazy(() => import("@/features/project/ProjectDetail"));
import { useAuth } from "@/stores/auth";
import type { ReactNode } from "react";
const DepartmentList = lazy(() => import("./features/department/DepartmentList/DepartmentList"));
const DepartmentDetail = lazy(() => import("./features/department/DepartmentDetail/DepartmentDetail"));
const AdminDashboard = lazy(() => import("./features/dashboard/AdminDashboard/AdminDashboard"));
const SystemNotificationsPage = lazy(() => import("./features/notifications/NotificationsPage"));
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
    const redirect = user.position ? positionHome[user.position] || "/" : "/";
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
      { index: true, element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserDashboard /></Suspense></RoleRedirect> },
      { path: "dashboard", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><AdminDashboard /></Suspense></RoleRedirect> },
      { path: "notifications", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><SystemNotificationsPage /></Suspense></RoleRedirect> },
      { path: "users", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserList /></Suspense></RoleRedirect> },
      { path: "users/trash", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><UserTrash /></Suspense></RoleRedirect> },
      { path: "users/password-reset-requests", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><PasswordResetRequests /></Suspense></RoleRedirect> },
      { path: "users/:id", element: <RoleRedirect roles={["admin", "user"]}><Suspense fallback={<RouteFallback />}><UserDetail /></Suspense></RoleRedirect> },
      { path: "departments", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><DepartmentList /></Suspense></RoleRedirect> },
      { path: "departments/:id", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><DepartmentDetail /></Suspense></RoleRedirect> },
      { path: "positions", element: <RoleRedirect roles={["admin"]}><Suspense fallback={<RouteFallback />}><PositionList /></Suspense></RoleRedirect> },
      { path: "projects", element: <RoleRedirect roles={["user"]}><Suspense fallback={<RouteFallback />}><ProjectList /></Suspense></RoleRedirect> },
      { path: "projects/:id", element: <RoleRedirect roles={["user"]}><Suspense fallback={<RouteFallback />}><ProjectDetail /></Suspense></RoleRedirect> },
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
