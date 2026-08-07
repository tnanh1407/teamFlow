import type { LucideIcon } from "lucide-react"
import { Bell, Briefcase, Building2, CheckSquare, LayoutDashboard, Medal, Settings, Shield, Users } from "lucide-react"

export interface SidebarItem {
  label: string
  icon: LucideIcon
  to?: string
  children?: SidebarItem[]
  roles?: Array<"admin" | "user">
}

export interface BreadcrumbRoute {
  path: string
  breadcrumbs: Array<{ label: string }>
}

export const sidebarItems: SidebarItem[] = [
  {
    label: "Tổng quan",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quản trị",
    icon: Shield,
    children: [
      {
        label: "Quản lý nhân viên",
        to: "/users",
        icon: Briefcase,
      },
      {
        label: "Phòng ban",
        to: "/departments",
        icon: Building2,
      },
      {
        label: "Chức vụ",
        to: "/positions",
        icon: Medal,
      },
      {
        label: "Dự án",
        to: "/projects",
        icon: CheckSquare,
        roles: ["user"],
      },
      {
        label: "Thông báo hệ thống",
        to: "/notifications",
        icon: Bell,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Cài đặt",
    icon: Settings,
    children: [
      {
        label: "Thông tin cá nhân",
        to: "/settings",
        icon: Users,
      },
    ],
  },
]

export const breadcrumbRoutes: BreadcrumbRoute[] = [
  {
    path: "/dashboard",
    breadcrumbs: [{ label: "Tổng quan" }],
  },
  {
    path: "/users",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lý nhân viên" },
    ],
  },
  {
    path: "/departments",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lý phòng ban" },
    ],
  },
  {
    path: "/positions",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lý chức vụ" },
    ],
  },
  {
    path: "/notifications",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Thông báo hệ thống" },
    ],
  },
  {
    path: "/projects",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Dự án" },
    ],
  },
  {
    path: "/settings",
    breadcrumbs: [{ label: "Cài đặt" }],
  },
]
