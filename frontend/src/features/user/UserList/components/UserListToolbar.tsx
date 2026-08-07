import { ChevronDown, Filter, Plus, Search, X } from "lucide-react"
import type { KeyboardEvent } from "react"

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
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      onSearchSubmit()
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Thêm nhân viên"
            title="Thêm nhân viên"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Thêm nhân viên</span>
          </button>

          <button
            type="button"
            onClick={onToggleFilters}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              filtersOpen || activeFilterCount > 0
                ? "bg-muted text-foreground"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-label="Mở bộ lọc"
            title="Mở bộ lọc"
          >
            <Filter size={16} />
            <span>Bộ lọc</span>
            {activeFilterCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <label className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as UserListToolbarProps["sortBy"])}
              className="h-11 appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition hover:bg-muted focus:ring-2 focus:ring-primary/20"
              aria-label="Sắp xếp danh sách nhân viên"
            >
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="hire-newest">Tuyển dụng mới nhất</option>
              <option value="hire-oldest">Tuyển dụng lâu nhất</option>
              <option value="role">Vai trò hệ thống</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted-foreground" />
          </label>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row xl:max-w-3xl">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo UUID, mã nhân viên, tên, email, bộ phận, username hoặc số điện thoại..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-11 w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
              aria-label="Tìm kiếm nhân viên trong bảng"
            />
          </div>

          <button
            type="button"
            onClick={onSearchSubmit}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
          >
            <Search size={16} />
            <span>Tìm kiếm</span>
          </button>

          <button
            type="button"
            onClick={onClearSearch}
            disabled={!hasSearchValue}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Xóa tìm kiếm"
            title="Xóa tìm kiếm"
          >
            <X size={16} />
            <span>Xóa tìm kiếm</span>
          </button>
        </div>
      </div>
    </section>
  )
}
