import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { ArrowLeft, CheckCircle2, Copy, LockKeyhole, Pencil, Trash2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/stores/auth"
import { MySwal } from "@/lib/swal"
import LoadingState from "@/shared/ui/LoadingState"
import PageSeo from "@/shared/ui/PageSeo"
import EmptyState from "@/shared/ui/EmptyState"
import { getPositionLabel as getSharedPositionLabel } from "@/shared/utils/position"
import { displayValue, formatDateOnly, formatDateTime } from "@/shared/utils/format"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import openUserFormEditDialog from "../UserList/components/UserFormEditDialog"

function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined
  const response = Reflect.get(error, "response")
  if (typeof response !== "object" || response === null) return undefined
  const status = Reflect.get(response, "status")
  return typeof status === "number" ? status : undefined
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const response = Reflect.get(error, "response")
    const data = typeof response === "object" && response !== null ? Reflect.get(response, "data") : null
    const message = typeof data === "object" && data !== null ? Reflect.get(data, "message") : null
    if (typeof message === "string" && message.trim()) return message
  }
  return fallback
}

function getInitials(name: string, username: string) {
  const source = name.trim() || username.trim()
  const words = source.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

function getRoleLabel(user: User, positionName: string) {
  if (user.role === "admin") return "Quản trị viên"
  return positionName || "Nhân viên"
}

function getGenderLabel(gender: User["gender"]) {
  if (gender === "male") return "Nam"
  if (gender === "female") return "Nữ"
  return "Khác"
}

async function copyValue(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Đã sao chép ${label}`)
  } catch {
    toast.error(`Không thể sao chép ${label}`)
  }
}

function DetailField({ label, value, copyLabel }: { label: string; value: string; copyLabel?: string }) {
  const canCopy = Boolean(copyLabel && value !== "Chưa có")
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
        <span className="min-w-0 wrap-break-word">{value}</span>
        {canCopy ? (
          <button type="button" onClick={() => void copyValue(value, copyLabel)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label={`Sao chép ${copyLabel}`} title={`Sao chép ${copyLabel}`}>
            <Copy size={13} />
          </button>
        ) : null}
      </dd>
    </div>
  )
}

function InfoSection({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border  shadow-sm bg-card p-5 sm:p-6 ${className}`}>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const [userRes, deptRes, posRes] = await Promise.all([userService.getById(id), departmentService.getAll(), positionService.getAll()])
      setUser(userRes.data.data)
      setDepartments(deptRes.data.data)
      setPositions(posRes.data.data)
    } catch (requestError: unknown) {
      if (getErrorStatus(requestError) === 404) setNotFound(true)
      else setError("Không thể tải thông tin người dùng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchDetail(), 0)
    return () => window.clearTimeout(timer)
  }, [fetchDetail])

  const deptNameMap = useMemo(() => new Map(departments.map((department) => [department.id, department.name] as const)), [departments])
  const posNameMap = useMemo(() => new Map(positions.map((position) => [position.id, position.name] as const)), [positions])
  const canEdit = Boolean(currentUser && user && (currentUser.role === "admin" ? user.id !== currentUser.id : currentUser.position === "manager" && user.id !== currentUser.id && user.position !== "manager"))

  const openFormDialog = async () => {
    if (!user || !canEdit) return
    const editingUser = user
    const result = await openUserFormEditDialog({
      editingUser,
      departments,
      positions,
      canEditEmployeeCode: currentUser?.role === "admin",
      onSubmit: async (payload) => { await userService.update(editingUser.id, payload) },
    })
    if (result?.changed) {
      toast.success("Cập nhật nhân viên thành công")
      await fetchDetail()
    }
  }

  const confirmDelete = async () => {
    if (!user || !canEdit || pendingDelete) return
    const confirmed = (await MySwal.fire({
      title: "Đưa nhân viên vào thùng rác?",
      icon: "warning",
      text: `${user.name || user.username} sẽ bị vô hiệu hóa và không thể đăng nhập cho đến khi được khôi phục.`,
      showCancelButton: true,
      confirmButtonText: "Đưa vào thùng rác",
      cancelButtonText: "Hủy",
      confirmButtonColor: "var(--destructive)",
      reverseButtons: true,
    })).isConfirmed
    if (!confirmed) return
    setPendingDelete(true)
    try {
      await userService.delete(user.id)
      toast.success("Đã đưa nhân viên vào thùng rác")
      navigate("/users")
    } catch (requestError: unknown) {
      void MySwal.fire({ icon: "error", title: "Không thể thực hiện", text: getErrorMessage(requestError, "Đưa nhân viên vào thùng rác thất bại"), confirmButtonText: "Đóng", confirmButtonColor: "var(--primary)" })
    } finally {
      setPendingDelete(false)
    }
  }

  if (loading) return <LoadingState label="Đang tải thông tin nhân viên..." />
  if (notFound) return <EmptyState title="Không tìm thấy người dùng" description="Người dùng có thể không tồn tại hoặc đã bị xóa khỏi hệ thống." action={<BackButton onClick={() => navigate("/users")} />} />
  if (error || !user) return <EmptyState title="Không thể tải thông tin nhân viên" description={error || "Dữ liệu người dùng hiện không khả dụng."} action={<div className="flex flex-wrap justify-center gap-2"><button type="button" onClick={() => void fetchDetail()} className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Thử lại</button><BackButton onClick={() => navigate("/users")} /></div>} />

  const departmentName = displayValue(deptNameMap.get(user.departmentId || ""))
  const positionName = getSharedPositionLabel(posNameMap.get(user.positionId || ""))
  const normalizedPositionName = positionName === "—" ? "Chưa có" : positionName
  const statusLabel = user.status ? "Đang hoạt động" : "Đã khóa"

  return (
    <div className="mx-auto w-full  space-y-6 pb-8">
      <PageSeo title={`Chi tiết ${displayValue(user.name)}`} description="Thông tin chi tiết nhân viên trong hệ thống." />
      <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0"><button type="button" onClick={() => navigate("/users")} className=" border border-border  shadow-sm bg-card mb-4 inline-flex min-h-9 items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label="Quay lại danh sách nhân viên"><ArrowLeft size={16} /> Quay lại danh sách</button><h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{displayValue(user.name)}</h1><p className="mt-1 text-sm text-muted-foreground">Chi tiết người dùng · @{displayValue(user.username)}</p></div>
        {canEdit ? <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void openFormDialog()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"><Pencil size={16} /> Sửa</button><button type="button" onClick={() => void confirmDelete()} disabled={pendingDelete} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={16} /> {pendingDelete ? "Đang xử lý..." : "Vô hiệu hóa"}</button></div> : null}
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar user={user} /><div className="min-w-0 flex-1"><h2 className="text-xl font-semibold text-foreground">{displayValue(user.name)}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{displayValue(user.email)}</p><p className="mt-1 text-sm text-muted-foreground">@{displayValue(user.username)}</p></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${user.status ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{user.status ? <CheckCircle2 size={14} /> : <LockKeyhole size={14} />}{statusLabel}</span></div></section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InfoSection title="Thông tin cá nhân"><DetailField label="Họ và tên" value={displayValue(user.name)} /><DetailField label="Email" value={displayValue(user.email)} copyLabel="email" /><DetailField label="Số điện thoại" value={displayValue(user.phone)} copyLabel="số điện thoại" /><DetailField label="Ngày sinh" value={formatDateOnly(user.birthDate)} /><DetailField label="Giới tính" value={getGenderLabel(user.gender)} /></InfoSection>
        <InfoSection title="Thông tin công việc"><DetailField label="Mã nhân viên" value={displayValue(user.employeeCode)} copyLabel="mã nhân viên" /><DetailField label="Phòng ban" value={departmentName} /><DetailField label="Chức vụ" value={normalizedPositionName} /><DetailField label="Ngày vào làm" value={formatDateOnly(user.hireDate)} /><DetailField label="Ngày nghỉ việc" value={formatDateOnly(user.leaveDate)} /></InfoSection>
        <InfoSection title="Thông tin tài khoản" className="lg:col-span-2"><DetailField label="Tên đăng nhập" value={displayValue(user.username)} copyLabel="tên đăng nhập" /><DetailField label="Vai trò" value={getRoleLabel(user, normalizedPositionName === "Chưa có" ? "" : normalizedPositionName)} /><DetailField label="Trạng thái" value={statusLabel} /><DetailField label="Ngày tạo" value={formatDateTime(user.createdAt)} /><DetailField label="Cập nhật cuối" value={formatDateTime(user.updatedAt)} /></InfoSection>
      </div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"><ArrowLeft size={16} /> Quay lại danh sách</button>
}

function Avatar({ user }: { user: User }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(user.avatarURL) && !failed
  return <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">{showImage ? <img src={user.avatarURL} alt={`Ảnh đại diện ${user.name}`} onError={() => setFailed(true)} className="h-full w-full object-cover" /> : getInitials(user.name, user.username)}</div>
}
