import type { MouseEvent } from "react"
import { Pencil, Trash2 } from "lucide-react"
import type { User } from "@/services/user.service"

interface UserRowActionsProps {
  user: User
  canEdit: boolean
  canDelete: boolean
  onEdit: (user: User) => void
  onDelete: (event: MouseEvent, user: User) => void
}

export default function UserRowActions({
  user,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: UserRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          title="Chỉnh sửa"
          aria-label="Chỉnh sửa"
        >
          <Pencil size={16} />
        </button>
      ) : null}

      {canDelete ? (
        <button
          type="button"
          onClick={(event) => onDelete(event, user)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/30"
          title="Xóa"
          aria-label="Xóa"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  )
}
