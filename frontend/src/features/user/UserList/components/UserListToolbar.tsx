import { ChevronDown, Plus, Search } from "lucide-react"

interface UserListToolbarProps {
  search: string
  sortBy: "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role"
  onAdd: () => void
  onSearchChange: (value: string) => void
  onSortChange: (value: UserListToolbarProps["sortBy"]) => void
}

export default function UserListToolbar({
  search,
  sortBy,
  onAdd,
  onSearchChange,
  onSortChange,
}: UserListToolbarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-6 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
        >
          <Plus size={18} />
        </button>

        <label className="relative inline-flex items-center">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as UserListToolbarProps["sortBy"])}
            className="h-10 appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-primary/30"
          >
            <option value="name-asc">Tên: A - Z</option>
            <option value="name-desc">Tên: Z - A</option>
            <option value="hire-newest">Tuyển dụng: mới - cũ</option>
            <option value="hire-oldest">Tuyển dụng: cũ - mới</option>
            <option value="role">Vai trò</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted-foreground" />
        </label>
      </div>

      <div className="relative">
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
  )
}
