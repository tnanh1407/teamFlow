import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogOut, Bell, ChevronDown, ChevronRight, LayoutDashboard, Shield, Building2, Briefcase, Medal, UserCog, Settings, CheckSquare, PanelLeft, PanelLeftClose } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Breadcrumb {
  label: string
  icon: LucideIcon
  href?: string
}

const breadcrumbMap: Record<string, Breadcrumb[]> = {
  "/": [{ label: "Tổng quan", icon: LayoutDashboard }],
  "/dashboard": [{ label: "Tổng quan", icon: LayoutDashboard }],
  "/employees": [
    { label: "Quản trị", icon: Shield },
    { label: "Quản lí nhân viên", icon: Briefcase },
  ],
  "/departments": [
    { label: "Quản trị", icon: Shield },
    { label: "Quản lí phòng ban", icon: Building2 },
  ],
  "/positions": [
    { label: "Quản trị", icon: Shield },
    { label: "Quản lí chức vụ", icon: Medal },
  ],
  "/members": [
    { label: "Quản lí tài khoản", icon: UserCog },
  ],
  "/projects": [
    { label: "Dự án", icon: CheckSquare },
  ],
  "/settings": [{ label: "Cài đặt", icon: Settings }],
}

export default function Header({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const crumbs = breadcrumbMap[location.pathname] ||
    (location.pathname.startsWith("/members/")
      ? [{ label: "Quản lí tài khoản", icon: UserCog }, { label: "Chi tiết", icon: UserCog }]
      : location.pathname.startsWith("/projects/")
        ? [{ label: "Dự án", icon: CheckSquare }, { label: "Chi tiết", icon: CheckSquare }]
        : location.pathname.startsWith("/employees/")
          ? [{ label: "Quản lí nhân viên", icon: Briefcase }, { label: "Chi tiết", icon: Briefcase }]
          : location.pathname.startsWith("/departments/")
            ? [{ label: "Phòng ban", icon: Building2 }, { label: "Chi tiết", icon: Building2 }]
            : [{ label: "TeamFlow", icon: LayoutDashboard }])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    member: "Member",
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "TF"

  return (
    <header className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer border-none"
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />}
            <crumb.icon
              size={15}
              className={
                i === crumbs.length - 1
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            />
            <span
              className={
                i === crumbs.length - 1
                  ? "font-semibold text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer border-none">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
          <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user.username}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase leading-tight">
                {roleLabel[user.position] || user.position}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-zinc-400 transition-transform hidden sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 sm:hidden">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.username}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">
                  {roleLabel[user.position] || user.position}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer border-none"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
        </div>
      )}
    </header>
  )
}
