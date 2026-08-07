import { useCallback, useEffect, useState } from "react"
import { Check, Clock3, X } from "lucide-react"
import { toast } from "sonner"
import { MySwal } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import PageSeo from "@/shared/ui/PageSeo"
import passwordResetRequestService, {
  type PasswordResetRequest,
  type PasswordResetRequestStatus,
} from "@/services/password-reset-request.service"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) return "Không thể xử lý yêu cầu"
  const response = Reflect.get(error, "response")
  const data = typeof response === "object" && response !== null ? Reflect.get(response, "data") : null
  const message = typeof data === "object" && data !== null ? Reflect.get(data, "message") : null
  return typeof message === "string" && message ? message : "Không thể xử lý yêu cầu"
}

export default function PasswordResetRequests() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [status, setStatus] = useState<PasswordResetRequestStatus>("pending")
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const response = await passwordResetRequestService.getAll(status)
      setRequests(response.data.data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRequests(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRequests])

  const handleAction = async (request: PasswordResetRequest, action: "approve" | "reject") => {
    const isApprove = action === "approve"
    const confirmation = (
      await MySwal.fire({
        icon: isApprove ? "question" : "warning",
        title: isApprove ? "Duyệt yêu cầu?" : "Từ chối yêu cầu?",
        text: isApprove
          ? `Hệ thống sẽ tạo mật khẩu mới và gửi đến ${request.email}.`
          : "Yêu cầu sẽ được đánh dấu là đã từ chối.",
        showCancelButton: true,
        confirmButtonText: isApprove ? "Duyệt và gửi email" : "Từ chối",
        cancelButtonText: "Hủy",
        confirmButtonColor: isApprove ? "var(--primary)" : "var(--destructive)",
        reverseButtons: true,
      })
    ).isConfirmed
    if (!confirmation) return

    setPendingId(request.id)
    try {
      if (isApprove) await passwordResetRequestService.approve(request.id)
      else await passwordResetRequestService.reject(request.id)
      toast.success(isApprove ? "Đã duyệt và gửi mật khẩu mới" : "Đã từ chối yêu cầu")
      await loadRequests()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageSeo title="Yêu cầu cấp lại mật khẩu" description="Kiểm tra và xử lý yêu cầu cấp lại mật khẩu của nhân viên." />
      <PageHeader
        title="Yêu cầu cấp lại mật khẩu"
        desc="Admin kiểm tra thông tin và duyệt yêu cầu trước khi hệ thống gửi mật khẩu mới qua email."
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        {(["pending", "approved", "rejected"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${status === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {value === "pending" ? "Chờ duyệt" : value === "approved" ? "Đã duyệt" : "Đã từ chối"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">Đang tải yêu cầu...</div>
        ) : requests.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Clock3 className="mx-auto mb-3 text-muted-foreground" size={28} />
            <p className="font-medium text-foreground">Không có yêu cầu nào</p>
            <p className="mt-1 text-sm text-muted-foreground">Các yêu cầu phù hợp sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phòng ban</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Thời gian gửi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Trạng thái</th>
                  {status === "pending" ? <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Thao tác</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{request.name}</p>
                      <p className="text-xs text-muted-foreground">{request.employeeCode || "Không có mã"} · {request.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{request.departmentName || "Không xác định"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(request.requestedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "pending" ? "bg-warning/15 text-warning" : request.status === "approved" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {request.status === "pending" ? "Chờ duyệt" : request.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                      </span>
                    </td>
                    {status === "pending" ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" disabled={pendingId === request.id} onClick={() => void handleAction(request, "approve")} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            <Check size={14} /> Duyệt
                          </button>
                          <button type="button" disabled={pendingId === request.id} onClick={() => void handleAction(request, "reject")} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">
                            <X size={14} /> Từ chối
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
