import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion";


// định nghĩa breadcrumbs
const routes = [
  {
    path: "/dashboard",
    breadcrumbs: [{ label: "Tổng quan" }],
  },
  {
    path: "/employees",
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
    path: "/members",
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
    breadcrumbs: [
      { label: "Cài đặt" },
    ],
  },
];

export default function Header({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  //  xử lí collapsed
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  // Định nghĩa router
  const route = routes.find((r) => location.pathname.startsWith(r.path));
  let crumbs = route?.breadcrumbs ?? [{ label: 'TeamFlow' }];

  if (route && location.pathname !== route.path) {
    crumbs = [...crumbs, { label: "Chi tiết" }];
  }


  return (
    <header className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">

        {/* MenuOption */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {collapsed ? (
            <PanelLeft size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </motion.button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {crumbs.map((crumb, index) => (
              <motion.span
                key={`${location.pathname}-${crumb.label}`}
                className="flex items-center gap-1.5 capitalize"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
              >
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                )}

                <span
                  className={
                    index === crumbs.length - 1
                      ? "font-semibold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {crumb.label}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
}
