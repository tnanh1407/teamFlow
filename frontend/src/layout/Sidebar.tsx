import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/stores/auth"
import { showConfirm } from "@/lib/swal"
import SystemLogo from "@/shared/ui/SystemLogo"
import { sidebarItems, type SidebarItem } from "@/config/navigation"
interface SidebarItemProps {
  item: SidebarItem;
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
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
    .filter((item): item is SidebarItem => item !== null)

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: "Xác nhận đăng xuất",
      html: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
      confirmText: "Đăng xuất",
      cancelText: "Huỷ",
      icon: "warning",
      confirmButtonColor: "#dc2626",
    })

    if (!confirmed) return

    await logout()
    navigate("/login")
  }

  return (
    <aside
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-border bg-background transition-all duration-300 ease-in-out ${collapsed ? "w-14" : "w-[20%] min-w-[200px] max-w-[280px]"
        }`}
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
      <SystemLogo className="h-7 w-7 shrink-0 transition-all duration-300 ease-in-out" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate text-lg font-bold capitalize text-foreground"
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

      <div className="shrink-0 border-t border-border p-3">
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {user.avatarURL ? (
                    <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user.username.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={handleLogout}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-none px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_10%,var(--background))] hover:text-[var(--danger)] ${collapsed ? "justify-center px-0" : ""
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
