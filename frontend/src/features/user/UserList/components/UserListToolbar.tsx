import { ChevronDown, LayoutGrid, List, Plus, Search } from "lucide-react"

interface UserListToolbarProps {
  search: string
  sortBy: "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role"
  viewMode: "list" | "grid"
  onAdd: () => void
  onSearchChange: (value: string) => void
  onSortChange: (value: UserListToolbarProps["sortBy"]) => void
  onToggleView: () => void
}

export default function UserListToolbar({
  search,
  sortBy,
  viewMode,
  onAdd,
  onSearchChange,
  onSortChange,
  onToggleView,
}: UserListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-sm sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">

          {/* thêm người dùng */}
          <button
            onClick={onAdd}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
          >
            <Plus size={18} />
          </button>


          <button
            type="button"
            onClick={onToggleView}
            aria-pressed={viewMode === "grid"}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${viewMode === "grid"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-foreground hover:bg-background"
              }`}
          >
            {viewMode === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
            <span className="hidden sm:inline">
              {viewMode === "list" ? "Chuyển sang grid" : "Chuyển sang list"}
            </span>
            <span className="sm:hidden">{viewMode === "list" ? "Grid" : "List"}</span>
          </button>

          {/* sắp xếp */}
          <label className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as UserListToolbarProps["sortBy"])}
              className="h-9 appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-primary/30"
            >
              <option value="name-asc">Sắp xếp theo tên từ A - Z</option>
              <option value="name-desc">Sắp xếp theo tên từ Z - A</option>
              <option value="hire-newest">Sắp xếp Tuyển dụng: mới - cũ</option>
              <option value="hire-oldest">Sắp xếp Tuyển dụng: cũ - mới</option>
              <option value="role">Sắp xếp Vai trò</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted-foreground" />
          </label>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã người dùng, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}
