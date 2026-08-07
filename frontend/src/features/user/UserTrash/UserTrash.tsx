import { useCallback, useEffect, useState } from "react"
import { RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { MySwal } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import PageSeo from "@/shared/ui/PageSeo"
import type { User } from "@/services/user.service"
import userService from "@/services/user.service"

const pageSize = 10
const retentionDays = 30

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value))
}

function getPurgeDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  date.setDate(date.getDate() + retentionDays)
  return date
}

function getDaysRemaining(value: string | null) {
  const purgeDate = getPurgeDate(value)
  if (!purgeDate) return null
  return Math.max(0, Math.ceil((purgeDate.getTime() - Date.now()) / 86_400_000))
}

export default function UserTrash() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTrash = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.getTrash({ page, limit: pageSize })
      setUsers(response.data.data)
      setTotal(response.data.total)
      setTotalPages(Math.max(1, response.data.totalPages))
    } catch {
      setError("Không thể tải dữ liệu đã xóa. Hãy kiểm tra migration cơ sở dữ liệu và quyền Admin.")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadTrash(), 0)
    return () => window.clearTimeout(timer)
  }, [loadTrash])

  const handleRestore = async (user: User) => {
    const confirmed = (
      await MySwal.fire({
        icon: "question",
        title: "Khôi phục nhân viên?",
        text: `Tài khoản ${user.name || user.username} sẽ trở lại danh sách nhân sự và có thể đăng nhập nếu được kích hoạt.`,
        showCancelButton: true,
        confirmButtonText: "Khôi phục",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      })
    ).isConfirmed
    if (!confirmed) return

    setPendingId(user.id)
    try {
      await userService.restore(user.id)
      toast.success("Đã khôi phục nhân viên")
      await loadTrash()
    } catch {
      toast.error("Không thể khôi phục nhân viên")
    } finally {
      setPendingId(null)
    }
  }

  const handleHardDelete = async (user: User) => {
    const firstConfirmation = (
      await MySwal.fire({
        icon: "warning",
        title: "Xóa vĩnh viễn nhân viên?",
        html: `Dữ liệu của <strong>${user.name || user.username}</strong> sẽ bị xóa khỏi database và không thể khôi phục.`,
        showCancelButton: true,
        confirmButtonText: "Tiếp tục",
        cancelButtonText: "Hủy",
        confirmButtonColor: "var(--destructive)",
        reverseButtons: true,
      })
    ).isConfirmed
    if (!firstConfirmation) return

    const secondConfirmation = (
      await MySwal.fire({
        icon: "error",
        title: "Xác nhận lần cuối",
        text: "Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn?",
        showCancelButton: true,
        confirmButtonText: "Xóa vĩnh viễn",
        cancelButtonText: "Hủy",
        confirmButtonColor: "var(--destructive)",
        reverseButtons: true,
      })
    ).isConfirmed
    if (!secondConfirmation) return

    setPendingId(user.id)
    try {
      await userService.hardDelete(user.id)
      toast.success("Đã xóa vĩnh viễn nhân viên")
      await loadTrash()
    } catch {
      toast.error("Không thể xóa vĩnh viễn nhân viên")
    } finally {
      setPendingId(null)
    }
  }

  const hasUsers = users.length > 0

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageSeo title="Nhân sự đã xóa" description="Khôi phục hoặc xóa vĩnh viễn nhân sự đã bị vô hiệu hóa." />
      <PageHeader
        title="Nhân sự đã xóa"
        desc="Khôi phục nhân sự đã xóa mềm hoặc xóa vĩnh viễn sau khi kiểm tra dữ liệu liên quan."
      />

      <div className="rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground">
        Nhân sự đã xóa sẽ được tự động xóa vĩnh viễn sau {retentionDays} ngày kể từ thời điểm xóa mềm.
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">Đang tải dữ liệu đã xóa...</div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-sm text-destructive">{error}</div>
        ) : !hasUsers ? (
          <div className="px-4 py-12 text-center">
            <Trash2 className="mx-auto mb-3 text-muted-foreground" size={28} />
            <p className="text-sm font-medium text-foreground">Không có nhân sự đã xóa</p>
            <p className="mt-1 text-xs text-muted-foreground">Nhân sự bị vô hiệu hóa sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mã nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Đã xóa lúc</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tự xóa sau</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const daysRemaining = getDaysRemaining(user.deletedAt)
                  return (
                    <tr key={user.id} className="transition hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarURL || "/avatarDefault.png"} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{user.name || "—"}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email || user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{user.employeeCode || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(user.deletedAt)}</td>
                      <td className="px-4 py-3 text-xs text-warning">
                        {daysRemaining === null ? "—" : `${daysRemaining} ngày`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={pendingId === user.id}
                            onClick={() => void handleRestore(user)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            Khôi phục
                          </button>
                          <button
                            type="button"
                            disabled={pendingId === user.id}
                            onClick={() => void handleHardDelete(user)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Xóa vĩnh viễn
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasUsers ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Đang hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} trên {total} nhân sự</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Trang trước</button>
            <span className="text-xs text-muted-foreground">Trang {page}/{totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Trang sau</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
