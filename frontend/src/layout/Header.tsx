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
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />
}

function HeaderSkeleton() {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 shadow-sm backdrop-blur sm:h-16 sm:px-6 sm:py-0">
      <div className="flex min-w-0 items-center gap-3">
        <SkeletonBlock className="h-9 w-9" />
        <div className="min-w-0 space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBlock className="h-10 w-40 sm:w-72" />
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
  const route = breadcrumbRoutes.find((item) => location.pathname.startsWith(item.path))
  let crumbs = route?.breadcrumbs ?? [{ label: "Quản trị" }]

  if (route && location.pathname !== route.path) {
    crumbs = [...crumbs, { label: "Chi tiết" }]
  }

  if (loading) return <HeaderSkeleton />

  return (
    <header className="flex min-h-16 shrink-0 flex-col gap-3 border-b border-border bg-card px-4 py-3 shadow-sm backdrop-blur sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
          title={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={collapsed ? "open" : "close"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {collapsed ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <nav className="hidden min-w-0 items-center gap-1.5 overflow-hidden sm:flex" aria-label="Breadcrumb">
          <AnimatePresence mode="wait" initial={false}>
            {crumbs.map((crumb, index) => (
              <motion.span
                key={`${location.pathname}-${crumb.label}`}
                className="flex min-w-0 items-center gap-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                {index > 0 ? <ChevronRight size={14} className="shrink-0 text-muted-foreground/60" /> : null}
                <span className={index === crumbs.length - 1 ? "truncate text-sm font-semibold text-foreground" : "truncate text-sm text-muted-foreground"}>
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

      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <ThemeToggle />
        {quickSearchEnabled ? (
          <button
            type="button"
            onClick={onQuickSearchClick}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-72 sm:flex-none"
            aria-label="Mở tìm kiếm nhanh"
          >
            <Search size={16} className="shrink-0" />
            <span className="flex-1 truncate text-left">Tìm kiếm...</span>
            <span className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">Ctrl K</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
