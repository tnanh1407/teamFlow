import { type MouseEvent } from "react"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/services/user.service"
import TableStateRow from "@/shared/ui/TableStateRow"
import UserRowActions from "./UserRowActions"
import UserStatusSwitch from "./UserStatusSwitch"

interface UserListTableProps {
  loading: boolean
  users: User[]
  deptNameMap: Map<string, string>
  posNameMap: Map<string, string>
  canEdit: (user: User) => boolean
  canDelete: (user: User) => boolean
  pendingStatusMap: Record<string, boolean>
  showUuid: boolean
  onView: (user: User) => void
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  onDelete: (event: MouseEvent, user: User) => void
}

function getShortUuid(value: string) {
  if (value.length <= 16) return value
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}

function normalizePositionLabel(positionName: string) {
  const normalizedPosition = positionName.trim().toLowerCase()

  if (normalizedPosition === "leader") return "Trưởng bộ phận"
  if (normalizedPosition === "manager") return "Quản lý nhóm"

  return positionName
}

function getRoleLabel(user: User, positionName: string) {
  if (user.role === "admin") return "Quản trị viên"
  if (positionName !== "—") return normalizePositionLabel(positionName)
  return "Nhân viên"
}

async function copyToClipboard(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  } catch {
    toast.error("Không thể sao chép")
  }
}

function UserAvatar({ user }: { user: User }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      <img src={user.avatarURL || "/avatarDefault.png"} alt="" className="h-full w-full object-cover" />
    </div>
  )
}

export default function UserListTable({
  loading,
  users,
  deptNameMap,
  posNameMap,
  canEdit,
  canDelete,
  pendingStatusMap,
  showUuid,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserListTableProps) {
  const colSpan = showUuid ? 8 : 7

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              {showUuid ? <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mã định danh</th> : null}
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mã nhân viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Họ và tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tên đăng nhập</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Chức vụ / vai trò</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              <TableStateRow colSpan={colSpan} loading title="Đang tải danh sách nhân viên..." />
            ) : users.length === 0 ? (
              <TableStateRow
                colSpan={colSpan}
                title="Không tìm thấy nhân viên phù hợp"
                description="Hãy thử thay đổi từ khóa tìm kiếm, sắp xếp hoặc bộ lọc."
              />
            ) : (
              users.map((user) => {
                const deptName = deptNameMap.get(user.departmentId || "") || "—"
                const positionName = posNameMap.get(user.positionId || "") || "—"
                const roleLabel = getRoleLabel(user, positionName)
                const pending = Boolean(pendingStatusMap[user.id])

                return (
                  <tr key={user.id} className="transition hover:bg-muted/40">
                    {showUuid ? (
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2 font-mono text-xs text-foreground" title={user.id}>                          <span>{getShortUuid(user.id)}</span>
                          <button
                            type="button"
                            onClick={() => void copyToClipboard(user.id, "Đã sao chép UUID")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Sao chép UUID"
                            title="Sao chép UUID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                    ) : null}

                    <td className="px-4 py-3 align-middle">
                      <UserAvatar user={user} />
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="inline-flex items-center gap-2 font-mono text-sm font-medium text-foreground">
                        <span>{user.employeeCode || "—"}</span>
                        {user.employeeCode ? (
                          <button
                            type="button"
                            onClick={() => void copyToClipboard(user.employeeCode || "", "Đã sao chép mã nhân viên")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Sao chép mã nhân viên"
                            title="Sao chép mã nhân viên"
                          >
                            <Copy size={13} />
                          </button>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => onView(user)}
                          className="text-left text-sm font-semibold text-foreground transition hover:text-primary"
                        >
                          {user.name || "—"}
                        </button>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email || "—"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{deptName}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => onView(user)}
                        className="text-left text-sm font-medium text-primary transition hover:underline"
                      >
                        {user.username || "—"}
                      </button>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${user.role === "admin"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-primary/10 text-primary"
                          }`}
                      >
                        {roleLabel}
                      </span>
                    </td>

                    {/* Trạng thái hoạt động */}
                    <td className="px-4 py-3 align-middle">
                      <UserStatusSwitch
                        checked={user.status}
                        disabled={!canEdit(user)}
                        pending={pending}
                        onToggle={() => onToggleStatus(user)}
                      />
                    </td>

                    <td className="px-4 py-3 align-middle text-right">
                      <UserRowActions
                        user={user}
                        canEdit={canEdit(user)}
                        canDelete={canDelete(user)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
