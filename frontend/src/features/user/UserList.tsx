import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpDown, Copy, Eye, Fingerprint, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
  leaveDate: string
  gender: "male" | "female" | "other"
  departmentId: string
  positionId: string
  username: string
  password: string
  position: AccountPosition
  status: boolean
}

const userSchema = z.object({
  employeeCode: z.string().trim().min(1, "Vui lòng nhập mã người dùng"),
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  leaveDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
  positionId: z.string().trim().min(1, "Vui lòng chọn chức vụ"),
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().optional(),
  position: z.enum(["manager", "member"]),
  status: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>

const emptyForm: FormData = {
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  hireDate: "",
  leaveDate: "",
  gender: "other",
  departmentId: "",
  positionId: "",
  username: "",
  password: "",
  position: "member",
  status: true,
}

function toFormValues(user?: User): UserFormValues {
  if (!user) return emptyForm
  return {
    employeeCode: user.employeeCode,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : "",
    hireDate: user.hireDate ? user.hireDate.slice(0, 10) : "",
    leaveDate: user.leaveDate ? user.leaveDate.slice(0, 10) : "",
    gender: user.gender || "other",
    departmentId: user.departmentId,
    positionId: user.positionId,
    username: user.username,
    password: "",
    position: user.position,
    status: user.status,
  }
}

const positionOptions: { value: AccountPosition; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
]

function getPositionLabel(position: string) {
  return positionOptions.find((p) => p.value === position)?.label ?? position
}

export default function UserList() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchUsers = async () => {
    try {
      const [userRes, deptRes, posRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        positionService.getAll(),
      ])
      setUsers(userRes.data.data)
      setDepartments(deptRes.data.data)
      setPositions(posRes.data.data)
    } catch {
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const deptNameMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name] as const)),
    [departments]
  )
  const posNameMap = useMemo(
    () => new Map(positions.map((p) => [p.id, p.name] as const)),
    [positions]
  )

  const visibleUsers = useMemo(() => {
    if (currentUser?.role === "admin") return users
    if (currentUser?.position === "manager" && currentUser.departmentId) {
      return users.filter((u) => u.departmentId === currentUser.departmentId)
    }
    return users
  }, [currentUser, users])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visibleUsers
    return visibleUsers.filter((u) =>
      [u.employeeCode, u.username, u.name, u.email]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [search, visibleUsers])

  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers]
    if (!sortDir) return arr
    arr.sort((a, b) => {
      const cmp = a.username.localeCompare(b.username)
      return sortDir === "asc" ? cmp : -cmp
    })
    return arr
  }, [filteredUsers, sortDir])

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const canEdit = (target: User) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return target.id !== currentUser.id
    if (currentUser.position === "manager") {
      return target.id !== currentUser.id && target.position === "member"
    }
    return false
  }

  const canDelete = (target: User) => canEdit(target)

  const openFormDialog = async (editingUser?: User) => {
    const isEdit = !!editingUser
    const dataRef: { current: UserFormValues | null } = { current: null }
    const validRef: { current: boolean } = { current: false }
    const formSchema = isEdit
      ? userSchema
      : userSchema.extend({
          password: z.string().trim().min(1, "Vui lòng nhập mật khẩu"),
        })

    function FormComponent() {
      const {
        register,
        watch,
        formState: { errors, isValid },
      } = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: toFormValues(editingUser),
      })

      const values = watch()

      useEffect(() => {
        dataRef.current = values
      }, [values])

      useEffect(() => {
        validRef.current = isValid
      }, [isValid])

      return (
        <div className="space-y-3 text-left">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Mã người dùng</label>
              <input {...register("employeeCode")} className={inputClass} />
              {errors.employeeCode?.message && <p className="mt-1 text-xs text-red-500">{errors.employeeCode.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Tên đăng nhập</label>
              <input {...register("username")} className={inputClass} />
              {errors.username?.message && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Họ và tên</label>
              <input {...register("name")} className={inputClass} />
              {errors.name?.message && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register("email")} className={inputClass} />
              {errors.email?.message && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phòng ban</label>
              <select {...register("departmentId")} className={`${inputClass} appearance-none`}>
                <option value="">-- Chọn --</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departmentId?.message && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Chức vụ</label>
              <select {...register("positionId")} className={`${inputClass} appearance-none`}>
                <option value="">-- Chọn --</option>
                {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.positionId?.message && <p className="mt-1 text-xs text-red-500">{errors.positionId.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mật khẩu {isEdit && <span className="font-normal text-zinc-400">(để trống nếu không đổi)</span>}</label>
              <input type="password" {...register("password")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vai trò</label>
              <select {...register("position")} className={`${inputClass} appearance-none`}>
                {positionOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input {...register("phone")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giới tính</label>
              <select {...register("gender")} className={`${inputClass} appearance-none`}>
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ngày sinh</label>
              <input type="date" {...register("birthDate")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ngày vào làm</label>
              <input type="date" {...register("hireDate")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ngày nghỉ việc</label>
              <input type="date" {...register("leaveDate")} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" {...register("status")} />
            <span className="text-sm text-zinc-700">Kích hoạt</span>
          </div>
        </div>
      )
    }

    const result = await MySwal.fire({
      title: isEdit ? "Sửa người dùng" : "Thêm người dùng",
      width: 640,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Tạo mới",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      preConfirm: () => {
        const d = dataRef.current
        if (!d) {
          MySwal.showValidationMessage("Vui lòng nhập đầy đủ thông tin")
          return false
        }
        if (!validRef.current) {
          MySwal.showValidationMessage("Vui lòng kiểm tra lại các trường bắt buộc")
          return false
        }
        return d
      },
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
        leaveDate: result.value.leaveDate || undefined,
        gender: result.value.gender,
        departmentId: result.value.departmentId,
        positionId: result.value.positionId,
        username: result.value.username,
        position: result.value.position,
        status: result.value.status,
      }
      if (result.value.password?.trim()) payload.password = result.value.password

      if (isEdit) {
        await userService.update(editingUser!.id, payload)
      } else {
        await userService.create(payload)
      }
      toast.success(isEdit ? "Cập nhật thành công" : "Tạo mới thành công")
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu thất bại")
    }
  }

  const confirmDelete = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation()
    const confirmed = await showDeleteConfirm({
      name: user.username,
      html: `Bạn có chắc muốn xoá người dùng <strong>${user.username}</strong>? Hành động này không thể hoàn tác.`,
    })
    if (!confirmed) return
    try {
      await userService.delete(user.id)
      toast.success("Xoá thành công")
      fetchUsers()
    } catch {
      toast.error("Xoá thất bại")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Quản lý người dùng</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-6 py-2 shadow-sm dark:bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <button onClick={() => openFormDialog()} className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-white text-zinc-400 transition-all hover:text-blue-500 hover:shadow-sm dark:bg-zinc-800">
            <Plus size={18} />
          </button>
          <button onClick={toggleSort} className="flex items-center gap-2 rounded-lg border-none px-3 py-2 text-sm font-medium transition-colors hover:bg-white dark:hover:bg-zinc-800">
            <ArrowUpDown size={16} className={sortDir ? "text-blue-500" : "text-zinc-400"} />
            {sortDir && <span>{sortDir === "asc" ? "A-Z" : "Z-A"}</span>}
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã người dùng, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

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
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">Đang tải...</td></tr>
              ) : sortedUsers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">Không tìm thấy người dùng nào</td></tr>
              ) : (
                sortedUsers.map((item) => {
                  const deptName = deptNameMap.get(item.departmentId) || "—"
                  const posName = posNameMap.get(item.positionId) || "—"
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                          <Fingerprint size={12} />
                          {item.id.slice(0, 8)}...
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.id); toast.success("Đã sao chép UUID") }} className="border-none bg-transparent p-0.5 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800">
                            <Copy size={12} />
                          </button>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
                          {item.avatarURL ? <img src={item.avatarURL} alt="" className="h-full w-full object-cover" /> : item.username.slice(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {item.employeeCode}
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.employeeCode) }} className="border-none bg-transparent p-0.5 text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800">
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.name || "—"}</div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{deptName} · {posName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/users/${item.id}`)} className="border-none bg-transparent text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                          {item.username}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : item.position === "manager" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                          {item.role === "admin" ? "Admin" : getPositionLabel(item.position)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.status ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status ? "bg-emerald-500" : "bg-red-500"}`} />
                          {item.status ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/users/${item.id}`)} className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400" title="Xem chi tiết">
                            <Eye size={15} />
                          </button>
                          {canEdit(item) && (
                            <button onClick={(e) => { e.stopPropagation(); openFormDialog(item) }} className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400" title="Sửa">
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete(item) && (
                            <button onClick={(e) => confirmDelete(e, item)} className="border-none rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400" title="Xoá">
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
    </div>
  )
}
