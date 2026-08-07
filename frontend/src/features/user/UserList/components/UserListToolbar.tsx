import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpDown, Check, ChevronDown, Filter, Plus, Search, X } from "lucide-react"
import IconButton from "@/shared/ui/IconButton"

interface UserListToolbarProps {
  search: string
  sortBy: "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role"
  filtersOpen: boolean
  activeFilterCount: number
  hasSearchValue: boolean
  onAdd: () => void
  onToggleFilters: () => void
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  onClearSearch: () => void
  onSortChange: (value: UserListToolbarProps["sortBy"]) => void
}

const controlClassName =
  "h-10 rounded-xl border border-border bg-background text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"

const sortOptions: Array<{
  value: UserListToolbarProps["sortBy"]
  label: string
  description: string
}> = [
  { value: "name-asc", label: "Tên A-Z", description: "Tên tăng dần" },
  { value: "name-desc", label: "Tên Z-A", description: "Tên giảm dần" },
  { value: "hire-newest", label: "Tuyển dụng mới nhất", description: "Ưu tiên ngày vào làm gần nhất" },
  { value: "hire-oldest", label: "Tuyển dụng lâu nhất", description: "Ưu tiên ngày vào làm lâu nhất" },
  { value: "role", label: "Vai trò hệ thống", description: "Sắp theo quyền tài khoản" },
]

export default function UserListToolbar({
  search,
  sortBy,
  filtersOpen,
  activeFilterCount,
  hasSearchValue,
  onAdd,
  onToggleFilters,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onSortChange,
}: UserListToolbarProps) {
  const sortMenuRef = useRef<HTMLDivElement>(null)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSortOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const activeSortOption = useMemo(
    () => sortOptions.find((option) => option.value === sortBy) ?? sortOptions[0],
    [sortBy]
  )

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      onSearchSubmit()
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:gap-2">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Thêm nhân viên"
              title="Thêm nhân viên"
            >
              <Plus size={16} />
              <span>Thêm nhân viên</span>
            </button>

            <button
              type="button"
              onClick={onToggleFilters}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-muted text-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-label="Bộ lọc"
              title="Bộ lọc"
            >
              <Filter size={16} />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <div ref={sortMenuRef} className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSortOpen((value) => !value)}
                className="flex h-10 min-w-[220px] items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-left text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Sắp xếp danh sách nhân viên"
                aria-expanded={sortOpen}
                aria-haspopup="menu"
              >
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <ArrowUpDown size={14} />
                  <span className="hidden text-xs font-medium lg:inline">Sắp xếp</span>
                </div>

                <div className="h-5 w-px shrink-0 bg-border" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{activeSortOption.label}</p>
                </div>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted-foreground transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {sortOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-12 z-50 w-[280px] overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-xl shadow-black/10"
                  >
                    {sortOptions.map((option) => {
                      const selected = option.value === sortBy

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onSortChange(option.value)
                            setSortOpen(false)
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            selected
                              ? "bg-primary/10 text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center pt-0.5">
                            {selected ? <Check size={14} className="text-primary" /> : <ArrowUpDown size={14} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{option.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:flex-nowrap lg:gap-2">
            <div className="relative min-w-0 flex-1 lg:w-[480px] lg:max-w-[480px] xl:w-[560px] xl:max-w-[560px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã nhân viên, email..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={`${controlClassName} w-full py-2 pl-10 ${hasSearchValue ? "pr-12" : "pr-4"} placeholder:text-muted-foreground`}
                aria-label="Tìm kiếm nhân viên trong bảng"
              />

              {hasSearchValue ? (
                <IconButton
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Xóa tìm kiếm"
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </IconButton>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onSearchSubmit}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Tìm kiếm"
              title="Tìm kiếm"
            >
              <Search size={16} />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
