import { type MouseEvent } from "react"
import { Copy, Eye, Fingerprint, Pencil, Trash2 } from "lucide-react"
import { type User } from "@/services/user.service"

interface UserListTableProps {
  loading: boolean
  users: User[]
  deptNameMap: Map<string, string>
  posNameMap: Map<string, string>
  canEdit: (user: User) => boolean
  canDelete: (user: User) => boolean
  onView: (user: User) => void
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  onDelete: (e: MouseEvent, user: User) => void
}

export default function UserListTable({
  loading,
  users,
  deptNameMap,
  posNameMap,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserListTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">UUID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mã người dùng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Họ và tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tên đăng nhập</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Vai trò</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((item) => {
                const deptName = deptNameMap.get(item.departmentId) || "—"
                const posName = posNameMap.get(item.positionId) || "—"

                return (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                        <Fingerprint size={12} />
                        {item.id}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(item.id)
                          }}
                          className="border-none bg-transparent p-0.5 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
                        {item.avatarURL ? (
                          <img src={item.avatarURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          item.username.slice(0, 2).toUpperCase()
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.employeeCode}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(item.employeeCode)
                          }}
                          className="border-none bg-transparent p-0.5 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.name || "—"}</div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {deptName} · {posName}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => onView(item)}
                        className="border-none bg-transparent text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {item.username}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.role === "admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                            : item.position === "manager"
                              ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}
                      >
                        {item.role === "admin" ? "Admin" : item.position === "manager" ? "Manager" : "Member"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => canEdit(item) && onToggleStatus(item)}
                        disabled={!canEdit(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                          item.status
                            ? "border-emerald-200 bg-emerald-500 dark:border-emerald-500/40 dark:bg-emerald-500"
                            : "border-zinc-300 bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-700"
                        } ${!canEdit(item) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        title={item.status ? "Đang hoạt động" : "Đang vô hiệu"}
                        aria-label={item.status ? "Đang hoạt động" : "Đang vô hiệu"}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            item.status ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(item)}
                          className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                          title="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        {canEdit(item) && (
                          <button
                            onClick={() => onEdit(item)}
                            className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                            title="Sửa"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete(item) && (
                          <button
                            onClick={(e) => onDelete(e, item)}
                            className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                            title="Xoá"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
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
