import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import userService, { type User, type UserPosition } from "@/services/user.service"
import employeeService, { type Employee } from "@/services/employee.service"
import departmentService from "@/services/department.service"
import positionService from "@/services/position.service"
import { useAuth } from "@/contexts/AuthContext"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

const positionOptions: { value: UserPosition; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
]

function getPositionOptions(currentPosition: UserPosition): { value: UserPosition; label: string }[] {
  if (currentPosition === "admin") return positionOptions
  return [positionOptions[0]]
}

function getRoleBadge(role: UserPosition): { label: string; classes: string } {
  switch (role) {
    case "admin":
      return { label: "Admin", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }
    case "manager":
      return { label: "Manager", classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" }
    case "member":
      return { label: "Member", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
    default:
      return { label: "Member", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
  }
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [deptName, setDeptName] = useState("—")
  const [posName, setPosName] = useState("—")
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [positionOpen, setPositionOpen] = useState(false)

  const [form, setForm] = useState({
    employeeId: "",
    username: "",
    password: "",
    position: "member" as UserPosition,
    status: true,
  })

  const fetchUser = async () => {
    if (!id) return
    try {
      const { data } = await userService.getById(id)
      const u = data.data
      setUser(u)
      setForm({
        employeeId: u.employeeId,
        username: u.username,
        password: "",
        position: u.position,
        status: u.status,
      })

      if (u.employeeId) {
        try {
          const [empRes, deptRes, posRes] = await Promise.all([
            employeeService.getById(u.employeeId),
            departmentService.getAll().catch(() => ({ data: { data: [] } })),
            positionService.getAll().catch(() => ({ data: { data: [] } })),
          ])
          const emp = empRes.data.data
          setEmployee(emp)
          if (emp?.departmentId) {
            const d = deptRes.data.data.find((item: any) => item.id === emp.departmentId)
            if (d) setDeptName(d.name)
          }
          if (emp?.positionId) {
            const p = posRes.data.data.find((item: any) => item.id === emp.positionId)
            if (p) setPosName(p.name)
          }
        } catch {
          // ignore
        }
      }
    } catch {
      console.error("Failed to fetch user")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  const canEdit = (): boolean => {
    if (!currentUser || !user) return false
    if (currentUser.position === "admin") {
      if (user.id === currentUser.id) return false
      return true
    }
    if (currentUser.position === "manager") {
      if (user.id === currentUser.id) return false
      if (user.position !== "member") return false
      return true
    }
    return false
  }

  const canDelete = (): boolean => {
    return canEdit()
  }

  const handleSave = async () => {
    if (!user) return
    try {
      const payload: Partial<User> & { password?: string } = {
        employeeId: form.employeeId,
        username: form.username,
        position: form.position,
        status: form.status,
      }
      if (form.password) payload.password = form.password
      await userService.update(user.id, payload)
      setEditOpen(false)
      fetchUser()
    } catch {
      console.error("Failed to update user")
    }
  }

  const handleDelete = async () => {
    if (!user) return
    try {
      await userService.delete(user.id)
      setDeleteOpen(false)
      navigate("/members")
    } catch {
      console.error("Failed to delete user")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "??"
  const avatarUrl = user?.avatarURL

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-zinc-500">Không tìm thấy người dùng</p>
        <button
          onClick={() => navigate("/members")}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
        >
          Quay lại
        </button>
      </div>
    )
  }

  const badge = getRoleBadge(user.position)
  const availablePositions = getPositionOptions(currentUser?.position ?? "member")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/members")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.username}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Chi tiết tài khoản người dùng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit() && (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
            >
              <Pencil size={15} />
              <span>Sửa</span>
            </button>
          )}
          {canDelete() && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer bg-transparent"
            >
              <Trash2 size={15} />
              <span>Xoá</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-4 p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
              >
                {badge.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  user.status
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${user.status ? "bg-emerald-500" : "bg-red-500"}`} />
                {user.status ? "Hoạt động" : "Vô hiệu"}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tên đăng nhập</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.username}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mã nhân viên</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">{user.employeeId}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Họ và tên</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{employee?.name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{employee?.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số điện thoại</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{employee?.phone || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phòng ban</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{deptName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chức vụ chuyên môn</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{posName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Vai trò tài khoản</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{badge.label}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trạng thái tài khoản</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.status ? "Hoạt động" : "Vô hiệu"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ngày tạo</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cập nhật lần cuối</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(user.updatedAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Sửa thành viên"
        width={420}
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none"
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none"
            >
              Cập nhật
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mã nhân viên</label>
            <input
              type="text"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="VD: NV001"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tên đăng nhập</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Mật khẩu <span className="text-zinc-400 font-normal">(để trống nếu không đổi)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Để trống nếu không đổi"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer border-none bg-transparent text-xs"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Vai trò</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPositionOpen(!positionOpen)}
                className={`${inputClass} flex items-center justify-between`}
              >
                <span>{positionOptions.find((o) => o.value === form.position)?.label ?? form.position}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {positionOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                  {availablePositions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, position: p.value })
                        setPositionOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${
                        form.position === p.value ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="status"
              checked={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.checked })}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-sm text-zinc-700 cursor-pointer">
              Kích hoạt
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá"
        variant="warning"
        confirmText="Xoá"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn xoá thành viên <strong>{user.username}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
