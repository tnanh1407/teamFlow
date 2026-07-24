import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  Settings,
  CheckSquare,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface NavGroup {
  label: string
  icon: LucideIcon
  children: { to: string; label: string; icon: LucideIcon }[]
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

type NavEntry = NavItem | NavGroup

function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry
}

const navItems: NavEntry[] = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  {
    label: "Quản trị",
    icon: Shield,
    children: [
      { to: "/members", label: "Quản lí thành viên", icon: Users },
      { to: "/departments", label: "Quản lí phòng ban", icon: Building2 },
      { to: "/tasks", label: "Quản lí project", icon: CheckSquare },
    ],
  },
  { to: "/settings", label: "Cài đặt", icon: Settings },
]

function NavGroupItem({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(true)
  const Icon = group.icon

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer border-none text-left"
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{group.label}</span>
            {open ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="ml-4 flex flex-col gap-0.5 mt-0.5">
          {group.children.map((child) => {
            const ChildIcon = child.icon
            return (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                <ChildIcon size={14} className="shrink-0" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 transition-all duration-200 min-h-0 overflow-hidden ${
        collapsed ? "w-14" : "w-[20%] min-w-[200px] max-w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          TF
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            TeamFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((entry) =>
          isGroup(entry) ? (
            <NavGroupItem key={entry.label} group={entry} collapsed={collapsed} />
          ) : (
            <NavLink
              key={entry.to}
              to={entry.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`
              }
            >
              <entry.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{entry.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 shrink-0">
        {!collapsed && user && (
          <div className="px-1 pb-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user.username}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors cursor-pointer border-none ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
