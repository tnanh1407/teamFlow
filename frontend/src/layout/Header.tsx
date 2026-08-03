import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ChevronRight, PanelLeft, PanelLeftClose, Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const routes = [
  {
    path: "/dashboard",
    breadcrumbs: [{ label: "Tổng quan" }],
  },
  {
    path: "/users",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lí nhân viên" },
    ],
  },
  {
    path: "/departments",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lí phòng ban" },
    ],
  },
  {
    path: "/positions",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lí chức vụ" },
    ],
  },
  {
    path: "/users",
    breadcrumbs: [
      { label: "Quản trị" },
      { label: "Quản lí tài khoản" },
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

interface HeaderProps {
  collapsed: boolean
  onToggle: () => void
  onQuickSearchClick: () => void
}

export default function Header({ collapsed, onToggle, onQuickSearchClick }: HeaderProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  const route = routes.find((r) => location.pathname.startsWith(r.path))
  let crumbs = route?.breadcrumbs ?? [{ label: "Quản Lý Phòng Ban & Dự Án" }]

  if (route && location.pathname !== route.path) {
    crumbs = [...crumbs, { label: "Chi tiết" }]
  }

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={onToggle}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:shadow-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={collapsed ? "open" : "close"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <nav className="flex items-center gap-2 overflow-hidden">
          <AnimatePresence mode="wait">
            {crumbs.map((crumb, index) => (
              <motion.span
                key={`${location.pathname}-${crumb.label}`}
                className="flex items-center gap-1.5 capitalize"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
              >
                {index > 0 && (
                  <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
                )}
                <span
                  className={
                    index === crumbs.length - 1
                      ? "font-sm text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 dark:text-zinc-400 text-sm"
                  }
                >
                  {crumb.label}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </nav>
      </div>

      <button className="flex items-center gap-2 h-10 w-72 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 text-sm text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 transition"
      onClick={onQuickSearchClick}>
        <Search size={16} className="text-zinc-400" />
        <span className="flex-1 text-left">Tìm kiếm...</span>
        <span className="rounded-md border border-zinc-300 dark:border-zinc-600 px-1.5 py-0.5 text-sm text-zinc-400">Ctrl K</span>
      </button>
    </header>
  )
}
