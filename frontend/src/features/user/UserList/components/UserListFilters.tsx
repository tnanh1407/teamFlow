import { Filter, X } from "lucide-react"
import type { Department } from "@/services/department.service"
import type { Position } from "@/services/position.service"

export interface UserListFiltersValue {
  departmentId: string
  roleOrPosition: string
  status: "all" | "active" | "inactive"
}

interface UserListFiltersProps {
  departments: Department[]
  positions: Position[]
  value: UserListFiltersValue
  activeChips: Array<{ key: string; label: string }>
  onChange: (value: UserListFiltersValue) => void
  onRemoveChip: (key: string) => void
  onClear: () => void
}

export default function UserListFilters({
  departments,
  positions,
  value,
  activeChips,
  onChange,
  onRemoveChip,
  onClear,
}: UserListFiltersProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Bộ lọc danh sách</h2>
              <p className="mt-1 text-sm text-muted-foreground">Lọc theo dữ liệu đang có từ danh sách nhân viên hiện tại.</p>
            </div>
          </div>

          {activeChips.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Xóa bộ lọc
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Phòng ban</span>
            <select
              value={value.departmentId}
              onChange={(event) => onChange({ ...value, departmentId: event.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Chức vụ / vai trò</span>
            <select
              value={value.roleOrPosition}
              onChange={(event) => onChange({ ...value, roleOrPosition: event.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả chức vụ / vai trò</option>
              <option value="role:admin">Quản trị viên</option>
              <option value="role:user">Tài khoản người dùng</option>
              {positions.map((position) => (
                <option key={position.id} value={`position:${position.id}`}>
                  {position.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Trạng thái hoạt động</span>
            <select
              value={value.status}
              onChange={(event) => onChange({ ...value, status: event.target.value as UserListFiltersValue["status"] })}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </label>
        </div>

        {activeChips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onRemoveChip(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                <span>{chip.label}</span>
                <X size={12} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
