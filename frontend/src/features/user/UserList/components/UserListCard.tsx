import { type MouseEvent } from "react"
import { CheckCircle2, CircleDashed, Copy, Fingerprint, Pencil, Trash2 } from "lucide-react"
import type { User } from "@/services/user.service"

interface UserListCardProps {
  user: User
  departmentName: string
  positionName: string
  canEdit: boolean
  canDelete: boolean
  onView: (user: User) => void
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  onDelete: (event: MouseEvent<HTMLButtonElement>, user: User) => void
}

export default function UserListCard({
  user,
  departmentName,
  positionName,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserListCardProps) {
  const handleCopyEmployeeCode = async () => {
    await navigator.clipboard.writeText(user.employeeCode || "")
  }

  return (
    <article className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onView(user)} className="flex min-w-0 items-center gap-3 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            {user.avatarURL ? (
              <img src={user.avatarURL} alt="" className="h-full w-full object-cover" />
            ) : (
              user.username.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name || "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.username}</p>
          </div>
        </button>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {user.role === "admin" ? "Admin" : "User"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Mã NV</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
            <Fingerprint size={12} />
            <span className="truncate">{user.employeeCode || "—"}</span>
            <button
              type="button"
              onClick={handleCopyEmployeeCode}
              className="rounded-md border border-transparent p-0.5 text-muted-foreground transition hover:border-border hover:bg-background"
              aria-label="Sao chép mã người dùng"
              title="Sao chép mã"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Trạng thái</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            {user.status ? <CheckCircle2 size={12} className="text-success" /> : <CircleDashed size={12} className="text-muted-foreground" />}
            <span>{user.status ? "Đang hoạt động" : "Đang vô hiệu"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{departmentName}</span>
          <span className="mx-1">·</span>
          <span>{positionName}</span>
        </p>
        <p className="text-muted-foreground">
          Tuyển dụng: {user.hireDate ? new Date(user.hireDate).toLocaleDateString("vi-VN") : "—"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(user)}
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background sm:flex-none"
        >
          Xem
        </button>

        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background sm:flex-none"
          >
            <Pencil size={14} />
            Sửa
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={(event) => onDelete(event, user)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background sm:flex-none"
          >
            <Trash2 size={14} />
            Xoá
          </button>
        )}

        <button
          type="button"
          onClick={() => canEdit && onToggleStatus(user)}
          disabled={!canEdit}
          className={`inline-flex min-w-24 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
            user.status
              ? "border border-success/20 bg-success/10 text-success"
              : "border border-border bg-muted text-muted-foreground"
          } ${!canEdit ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {user.status ? "Hoạt động" : "Vô hiệu"}
        </button>
      </div>
    </article>
  )
}
