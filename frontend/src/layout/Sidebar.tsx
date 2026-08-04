import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  Briefcase,
  Medal,
  CheckSquare,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import dashboardImg from "@/assets/dashboard.png"

interface ISidebarItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  children?: ISidebarItem[];
  roles?: Array<"admin" | "user">;
}

const sidebarItems: ISidebarItem[] = [
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
        label: "Nhân viên",
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
];
interface SidebarItemProps {
  item: ISidebarItem;
  collapsed: boolean;
}
interface SidebarProps {
  collapsed: boolean;
}


function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const [open, setOpen] = useState(true);

  const Icon = item.icon;

  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center px-0" : ""
          } ${isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`
        }
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Icon size={18} />

        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>

            {open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {item.children.map((child) => {
            const ChildIcon = child.icon;

            return (
              <NavLink
                key={child.to}
                to={child.to!}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`
                }
              >
                <ChildIcon size={15} />
                <span>{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default function Sidebar({ collapsed }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const visibleItems = sidebarItems
    .map((item) => {
      if (item.roles && user?.role && !item.roles.includes(user.role)) return null
      if (!item.children) return item

      const children = item.children.filter((child) => !child.roles || !user?.role || child.roles.includes(user.role))
      if (children.length === 0) return null

      return { ...item, children }
    })
    .filter((item): item is ISidebarItem => item !== null)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 transition-all duration-300 ease-in-out min-h-0 overflow-hidden ${collapsed ? "w-14" : "w-[20%] min-w-[200px] max-w-[280px]"
        }`}
    >
      <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "gap-3"} h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0`}>
      <img src={dashboardImg} alt="dashboard_img" className={`object-contain shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "h-7 w-7" : "h-9 w-9"}`}></img>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate capitalize"
            >
              Trang Quản Lý
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 shrink-0">
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-1 pb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user.username.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    HELLO
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors cursor-pointer border-none ${collapsed ? "justify-center px-0" : ""
            }`}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Đăng xuất
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  )
}
