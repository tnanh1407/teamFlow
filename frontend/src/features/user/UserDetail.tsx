import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { MySwal, showDeleteConfirm } from "@/lib/swal"
import userService, { type AccountPosition, type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"

interface FormData {
  employeeCode: string
  name: string
  email: string
  phone: string
  birthDate: string
  hireDate: string
  gender: "male" | "female" | "other"
  departmentId: string
  positionId: string
  username: string
  password: string
  position: AccountPosition
  status: boolean
}

const positionOptions: { value: AccountPosition; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
]

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDetail = async () => {
    if (!id) return
    try {
      const [userRes, deptRes, posRes] = await Promise.all([
        userService.getById(id),
        departmentService.getAll(),
        positionService.getAll(),
      ])
      setUser(userRes.data.data)
      setDepartments(deptRes.data.data)
      setPositions(posRes.data.data)
    } catch {
      toast.error("Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const deptNameMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name] as const)), [departments])
  const posNameMap = useMemo(() => new Map(positions.map((p) => [p.id, p.name] as const)), [positions])

  const canEdit = () => {
    if (!currentUser || !user) return false
    if (currentUser.role === "admin") return user.id !== currentUser.id
    if (currentUser.position === "manager") return user.id !== currentUser.id && user.position === "member"
    return false
  }

  const openFormDialog = async () => {
    if (!user) return
    const editingUser = user
    const dataRef: { current: FormData | null } = { current: null }

    function FormComponent() {
      const [f, setF] = useState<FormData>({
        employeeCode: editingUser.employeeCode,
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone || "",
        birthDate: editingUser.birthDate ? editingUser.birthDate.slice(0, 10) : "",
        hireDate: editingUser.hireDate ? editingUser.hireDate.slice(0, 10) : "",
        gender: editingUser.gender || "other",
        departmentId: editingUser.departmentId,
        positionId: editingUser.positionId,
        username: editingUser.username,
        password: "",
        position: editingUser.position,
        status: editingUser.status,
      })

      dataRef.current = f

      return (
        <div className="space-y-3 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mã người dùng</label>
              <input value={f.employeeCode} onChange={(e) => setF((p) => ({ ...p, employeeCode: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tên đăng nhập</label>
              <input value={f.username} onChange={(e) => setF((p) => ({ ...p, username: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Họ và tên</label>
              <input value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phòng ban</label>
              <select value={f.departmentId} onChange={(e) => setF((p) => ({ ...p, departmentId: e.target.value }))} className={`${inputClass} appearance-none`}>
                <option value="">-- Chọn --</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Chức vụ</label>
              <select value={f.positionId} onChange={(e) => setF((p) => ({ ...p, positionId: e.target.value }))} className={`${inputClass} appearance-none`}>
                <option value="">-- Chọn --</option>
                {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mật khẩu</label>
              <input type="password" value={f.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vai trò</label>
              <select value={f.position} onChange={(e) => setF((p) => ({ ...p, position: e.target.value as AccountPosition }))} className={`${inputClass} appearance-none`}>
                {positionOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input value={f.phone} onChange={(e) => setF((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giới tính</label>
              <select value={f.gender} onChange={(e) => setF((p) => ({ ...p, gender: e.target.value as FormData["gender"] }))} className={`${inputClass} appearance-none`}>
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ngày sinh</label>
              <input type="date" value={f.birthDate} onChange={(e) => setF((p) => ({ ...p, birthDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ngày vào làm</label>
              <input type="date" value={f.hireDate} onChange={(e) => setF((p) => ({ ...p, hireDate: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" checked={f.status} onChange={(e) => setF((p) => ({ ...p, status: e.target.checked }))} />
            <span className="text-sm text-zinc-700">Kích hoạt</span>
          </div>
        </div>
      )
    }

    const result = await MySwal.fire({
      title: "Sửa người dùng",
      width: 640,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      preConfirm: () => dataRef.current,
    })

    if (!result.isConfirmed || !result.value) return

    try {
      const payload: Record<string, unknown> = {
        employeeCode: result.value.employeeCode,
        name: result.value.name,
        email: result.value.email,
        phone: result.value.phone,
        birthDate: result.value.birthDate || undefined,
        hireDate: result.value.hireDate || undefined,
        gender: result.value.gender,
        departmentId: result.value.departmentId,
        positionId: result.value.positionId,
        username: result.value.username,
        position: result.value.position,
        status: result.value.status,
      }
      if (result.value.password) payload.password = result.value.password

      await userService.update(editingUser.id, payload)
      toast.success("Cập nhật thành công")
      fetchDetail()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại")
    }
  }

  const confirmDelete = async () => {
    if (!user) return
    const confirmed = await showDeleteConfirm({
      name: user.username,
      html: `Bạn có chắc muốn xoá người dùng <strong>${user.username}</strong>? Hành động này không thể hoàn tác.`,
    })
    if (!confirmed) return
    try {
      await userService.delete(user.id)
      navigate("/users")
    } catch {
      toast.error("Xoá thất bại")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-500">Không tìm thấy người dùng</p>
        <button onClick={() => navigate("/users")} className="cursor-pointer rounded-lg border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/users")} className="flex h-9 w-9 items-center justify-center rounded-lg border-none text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{user.username}</h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Chi tiết người dùng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit() && (
            <button onClick={openFormDialog} className="flex items-center gap-2 rounded-lg border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              <Pencil size={15} />
              <span>Sửa</span>
            </button>
          )}
          {canEdit() && (
            <button onClick={confirmDelete} className="flex items-center gap-2 rounded-lg border border-red-200 bg-transparent px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
              <Trash2 size={15} />
              <span>Xoá</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
            {user.avatarURL ? <img src={user.avatarURL} alt="" className="h-full w-full object-cover" /> : user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.name || user.username}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <Field label="Mã người dùng" value={user.employeeCode} />
          <Field label="Tên đăng nhập" value={user.username} />
          <Field label="Họ và tên" value={user.name || "—"} />
          <Field label="Email" value={user.email || "—"} />
          <Field label="Số điện thoại" value={user.phone || "—"} />
          <Field label="Phòng ban" value={deptNameMap.get(user.departmentId) || "—"} />
          <Field label="Chức vụ" value={posNameMap.get(user.positionId) || "—"} />
          <Field label="Vai trò" value={user.role === "admin" ? "Admin" : user.position === "manager" ? "Manager" : "Member"} />
          <Field label="Trạng thái" value={user.status ? "Hoạt động" : "Vô hiệu"} />
          <Field label="Ngày tạo" value={new Date(user.createdAt).toLocaleString("vi-VN")} />
          <Field label="Cập nhật cuối" value={new Date(user.updatedAt).toLocaleString("vi-VN")} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  )
}
