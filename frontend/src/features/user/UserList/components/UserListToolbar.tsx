import { ArrowUpDown, Plus, Search } from "lucide-react"

interface UserListToolbarProps {
  search: string
  sortDir: "asc" | "desc" | null
  onAdd: () => void
  onSearchChange: (value: string) => void
  onToggleSort: () => void
}

export default function UserListToolbar({
  search,
  sortDir,
  onAdd,
  onSearchChange,
  onToggleSort,
}: UserListToolbarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-6 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={onToggleSort}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowUpDown size={16} className={sortDir ? "text-blue-500" : "text-zinc-400"} />
          {sortDir && <span>{sortDir === "asc" ? "A-Z" : "Z-A"}</span>}
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, mã người dùng, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-100"
        />
      </div>
    </div>
  )
}
