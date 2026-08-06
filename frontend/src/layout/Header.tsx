import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ChevronRight, PanelLeft, PanelLeftClose, Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { breadcrumbRoutes } from "@/config/navigation"
import ThemeToggle from "@/shared/ui/ThemeToggle"

interface HeaderProps {
  collapsed: boolean
  onToggle: () => void
  onQuickSearchClick: () => void
  quickSearchEnabled?: boolean
  loading?: boolean
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
}

function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SkeletonBlock className="h-9 w-9 rounded-lg" />
        <div className="min-w-0 space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBlock className="h-10 w-40 rounded-xl sm:w-72" />
    </header>
  )
}

export default function Header({
  collapsed,
  onToggle,
  onQuickSearchClick,
  quickSearchEnabled = true,
  loading = false,
}: HeaderProps) {
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

  const route = breadcrumbRoutes.find((r) => location.pathname.startsWith(r.path))
  let crumbs = route?.breadcrumbs ?? [{ label: "Quản Lý Phòng Ban & Dự Án" }]

  if (route && location.pathname !== route.path) {
    crumbs = [...crumbs, { label: "Chi tiết" }]
  }

  if (loading) return <HeaderSkeleton />

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:shadow-sm"
            aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            title={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
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


        </div>

        <nav className="hidden min-w-0 items-center gap-2 overflow-hidden sm:flex">
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
                  <ChevronRight size={14} className="text-muted-foreground/60" />
                )}
                <span
                  className={
                    index === crumbs.length - 1
                      ? "text-sm font-semibold text-foreground"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {crumb.label}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </nav>

        <div className="min-w-0 sm:hidden">
          <p className="truncate text-sm font-semibold text-foreground">{crumbs[crumbs.length - 1]?.label}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <ThemeToggle />
        {/* tìm kiêm nhanh */}
        {quickSearchEnabled ? (
          <button
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground transition hover:bg-background hover:text-foreground sm:w-72"
            onClick={onQuickSearchClick}
          >
            <Search size={16} className="text-muted-foreground" />
            <span className="flex-1 truncate text-left">Tìm kiếm...</span>
            <span className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
              Ctrl K
            </span>
          </button>
        ) : (
          <div className="hidden sm:block sm:w-72" />
        )}
      </div>
    </header>
  )
}
