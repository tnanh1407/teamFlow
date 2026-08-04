import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { MySwal, showDeleteConfirm } from "@/lib/swal"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"

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
  status: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

function buildUserSchema(departments: Department[]) {
  const departmentCodeMap = new Map(departments.map((department) => [department.id, department.code.trim().toUpperCase()] as const))

  return z
    .object({
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
      status: z.boolean(),
    })
    .superRefine((data, ctx) => {
      const departmentCode = departmentCodeMap.get(data.departmentId)
      const employeeCode = data.employeeCode.trim().toUpperCase()

      if (!departmentCode) return

      if (!employeeCode.startsWith(departmentCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: `Mã người dùng phải bắt đầu bằng mã phòng ban ${departmentCode}`,
        })
        return
      }

      const suffix = employeeCode.slice(departmentCode.length)
      if (!/^[A-Z0-9]{6}$/.test(suffix)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: "Phần sau mã phòng ban phải gồm đúng 6 ký tự chữ hoặc số",
        })
      }
    })
}

function toFormValues(user?: User): UserFormValues {
  if (!user) {
    return {
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
      status: true,
    }
  }

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
    status: user.status,
  }
}

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
    if (currentUser.position === "manager") return user.id !== currentUser.id && user.position !== "manager"
    return false
  }

  const openFormDialog = async () => {
    if (!user) return
    const editingUser = user
    const dataRef: { current: UserFormValues | null } = { current: null }
    const validRef: { current: boolean } = { current: false }

    function FormComponent() {
      const {
        register,
        watch,
        formState: { errors, isValid },
      } = useForm<UserFormValues>({
        resolver: zodResolver(buildUserSchema(departments)),
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
              <input {...register("employeeCode", { setValueAs: (value) => (typeof value === "string" ? value.toUpperCase() : value) })} className={inputClass} placeholder="VD: hrABC123" />
              <p className="mt-1 text-[11px] text-zinc-500">
                Mã phòng ban + 6 ký tự. Ví dụ:{" "}
                <span className="font-medium text-zinc-700">
                  {(departments.find((d) => d.id === watch("departmentId"))?.code || "DEPT").trim().toUpperCase()}ABC123
                </span>
              </p>
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
              <label className={labelClass}>Mật khẩu</label>
              <input type="password" {...register("password")} className={inputClass} />
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
      title: "Sửa người dùng",
      width: 640,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
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
        leaveDate: result.value.status ? undefined : (result.value.leaveDate || undefined),
        gender: result.value.gender,
        departmentId: result.value.departmentId,
        positionId: result.value.positionId,
        username: result.value.username,
        status: result.value.status,
      }
      if (result.value.password?.trim()) payload.password = result.value.password

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
          <Field label="Ngày vào làm" value={user.hireDate ? user.hireDate.slice(0, 10) : "—"} />
          <Field label="Ngày nghỉ việc" value={user.leaveDate ? user.leaveDate.slice(0, 10) : "—"} />
          <Field label="Phòng ban" value={deptNameMap.get(user.departmentId) || "—"} />
          <Field label="Chức vụ" value={posNameMap.get(user.positionId) || "—"} />
          <Field label="Loại tài khoản" value={user.role === "admin" ? "Admin" : "Người dùng"} />
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
