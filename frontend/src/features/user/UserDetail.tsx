import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/stores/auth"
import { MySwal } from "@/lib/swal"
import LoadingState from "@/shared/ui/LoadingState"
import EmptyState from "@/shared/ui/EmptyState"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import { getPositionLabel as getSharedPositionLabel } from "@/shared/utils/position"

const userSchema = z.object({
  employeeCode: z.string().trim().min(1, "Vui lÃ²ng nháº­p mÃ£ ngÆ°á»i dÃ¹ng"),
  name: z.string().trim().min(1, "Vui lÃ²ng nháº­p há» vÃ  tÃªn"),
  email: z.string().trim().email("Email khÃ´ng há»£p lá»‡"),
  phone: z.string().trim().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  leaveDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  departmentId: z.string().trim().min(1, "Vui lÃ²ng chá»n phÃ²ng ban"),
  positionId: z.string().trim().min(1, "Vui lÃ²ng chá»n chá»©c vá»¥"),
  username: z.string().trim().min(1, "Vui lÃ²ng nháº­p tÃªn Ä‘Äƒng nháº­p"),
  password: z.string().optional(),
  status: z.boolean(),
})

type UserFormValues = {
  employeeCode: string | undefined
  name: string
  email: string
  phone?: string
  birthDate?: string
  hireDate?: string
  leaveDate?: string
  gender: "male" | "female" | "other"
  departmentId: string | undefined
  positionId: string | undefined
  username: string
  password?: string
  status: boolean
}

void userSchema

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

function getPositionLabel(positionName?: string | null) {
  const normalized = positionName?.trim().toLowerCase()
  if (!normalized) return "â€”"
  if (normalized.includes("leader")) return "Trưởng bộ phận"
  if (normalized.includes("manager")) return "Quản lý nhóm"
  return positionName ?? "â€”"
}

function buildUserSchema(departments: Department[], allowAdminEmptyFields: boolean) {
  const departmentCodeMap = new Map(departments.map((department) => [department.id, department.code.trim().toUpperCase()] as const))

  return z
    .object({
      employeeCode: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lÃ²ng nháº­p mÃ£ ngÆ°á»i dÃ¹ng"),
      name: z.string().trim().min(1, "Vui lÃ²ng nháº­p há» vÃ  tÃªn"),
      email: z.string().trim().email("Email khÃ´ng há»£p lá»‡"),
      phone: z.string().trim().optional(),
      birthDate: z.string().optional(),
      hireDate: z.string().optional(),
      leaveDate: z.string().optional(),
      gender: z.enum(["male", "female", "other"]),
      departmentId: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lÃ²ng chá»n phÃ²ng ban"),
      positionId: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lÃ²ng chá»n chá»©c vá»¥"),
      username: z.string().trim().min(1, "Vui lÃ²ng nháº­p tÃªn Ä‘Äƒng nháº­p"),
      password: z.string().optional(),
      status: z.boolean(),
    })
    .superRefine((data, ctx) => {
      const employeeCode = (data.employeeCode ?? "").trim().toUpperCase()
      const departmentId = data.departmentId?.trim() || ""
      if (allowAdminEmptyFields && !employeeCode && !departmentId) return

      const departmentCode = departmentCodeMap.get(departmentId)
      if (!departmentCode) {
        if (allowAdminEmptyFields && !departmentId) return

        ctx.addIssue({
          code: "custom",
          path: ["departmentId"],
          message: "Vui lÃ²ng chá»n phÃ²ng ban",
        })
        return
      }

      if (!employeeCode) {
        if (allowAdminEmptyFields) return

        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: "Vui lÃ²ng nháº­p mÃ£ ngÆ°á»i dÃ¹ng",
        })
        return
      }

      if (!employeeCode.startsWith(departmentCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: `MÃ£ ngÆ°á»i dÃ¹ng pháº£i báº¯t Ä‘áº§u báº±ng mÃ£ phÃ²ng ban ${departmentCode}`,
        })
        return
      }

      const suffix = employeeCode.slice(departmentCode.length)
      if (!/^[A-Z0-9]{6}$/.test(suffix)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: "Pháº§n sau mÃ£ phÃ²ng ban pháº£i gá»“m Ä‘Ãºng 6 kÃ½ tá»± chá»¯ hoáº·c sá»‘",
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
    employeeCode: user.employeeCode || "",
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : "",
    hireDate: user.hireDate ? user.hireDate.slice(0, 10) : "",
    leaveDate: user.leaveDate ? user.leaveDate.slice(0, 10) : "",
    gender: user.gender || "other",
    departmentId: user.departmentId || "",
    positionId: user.positionId || "",
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
      void MySwal.fire({
        icon: "error",
        title: "Lá»—i",
        text: "KhÃ´ng thá»ƒ táº£i thÃ´ng tin ngÆ°á»i dÃ¹ng",
        confirmButtonText: "ÄÃ³ng",
        confirmButtonColor: "var(--primary)",
      })
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
        resolver: zodResolver(buildUserSchema(departments, editingUser?.role === "admin")),
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
              <label className={labelClass}>MÃ£ ngÆ°á»i dÃ¹ng</label>
              <input {...register("employeeCode", { setValueAs: (value) => (typeof value === "string" ? value.toUpperCase() : value) })} className={inputClass} placeholder="VD: hrABC123" />
              <p className="mt-1 text-[11px] text-zinc-500">
                MÃ£ phÃ²ng ban + 6 kÃ½ tá»±. VÃ­ dá»¥:{" "}
                <span className="font-medium text-zinc-700">
                  {(departments.find((d) => d.id === watch("departmentId"))?.code || "DEPT").trim().toUpperCase()}ABC123
                </span>
              </p>
              {errors.employeeCode?.message && <p className="mt-1 text-xs text-red-500">{errors.employeeCode.message}</p>}
            </div>
            <div>
              <label className={labelClass}>TÃªn Ä‘Äƒng nháº­p</label>
              <input {...register("username")} className={inputClass} />
              {errors.username?.message && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Há» vÃ  tÃªn</label>
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
              <label className={labelClass}>PhÃ²ng ban</label>
              <select {...register("departmentId")} className={`${inputClass} appearance-none`}>
                <option value="">-- Chá»n --</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departmentId?.message && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Chá»©c vá»¥</label>
              <select {...register("positionId")} className={`${inputClass} appearance-none`}>
                <option value="">-- Chá»n --</option>
                {positions.map((p) => <option key={p.id} value={p.id}>{getSharedPositionLabel(p.name)}</option>)}
              </select>
              {errors.positionId?.message && <p className="mt-1 text-xs text-red-500">{errors.positionId.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Máº­t kháº©u</label>
              <input type="password" {...register("password")} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sá»‘ Ä‘iá»‡n thoáº¡i</label>
              <input {...register("phone")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giá»›i tÃ­nh</label>
              <select {...register("gender")} className={`${inputClass} appearance-none`}>
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>NgÃ y sinh</label>
              <input type="date" {...register("birthDate")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NgÃ y vÃ o lÃ m</label>
              <input type="date" {...register("hireDate")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NgÃ y nghá»‰ viá»‡c</label>
              <input type="date" {...register("leaveDate")} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" {...register("status")} />
            <span className="text-sm text-zinc-700">KÃ­ch hoáº¡t</span>
          </div>
        </div>
      )
    }

    const result = await MySwal.fire({
      title: "Sá»­a ngÆ°á»i dÃ¹ng",
      width: 640,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: "Cáº­p nháº­t",
      cancelButtonText: "Há»§y",
      reverseButtons: true,
      preConfirm: () => {
        const d = dataRef.current
        if (!d) {
          MySwal.showValidationMessage("Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin")
          return false
        }
        if (!validRef.current) {
          MySwal.showValidationMessage("Vui lÃ²ng kiá»ƒm tra láº¡i cÃ¡c trÆ°á»ng báº¯t buá»™c")
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
      void MySwal.fire({
        icon: "success",
        title: "ThÃ nh cÃ´ng",
        text: "Cáº­p nháº­t thÃ nh cÃ´ng",
        confirmButtonText: "ÄÃ³ng",
        confirmButtonColor: "var(--primary)",
      })
      fetchDetail()
    } catch (err: any) {
      void MySwal.fire({
        icon: "error",
        title: "Lá»—i",
        text: err?.response?.data?.message || "Cáº­p nháº­t tháº¥t báº¡i",
        confirmButtonText: "ÄÃ³ng",
        confirmButtonColor: "var(--primary)",
      })
    }
  }

  const confirmDelete = async () => {
    if (!user) return
    const confirmed = (await MySwal.fire({
      title: "XÃ¡c nháº­n xoÃ¡",
      icon: "warning",
      html: `Báº¡n cÃ³ cháº¯c muá»‘n xoÃ¡ ngÆ°á»i dÃ¹ng <strong>${user.username}</strong>? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.`,
      showCancelButton: true,
      confirmButtonText: "XoÃ¡",
      cancelButtonText: "Huá»·",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    })).isConfirmed
    if (!confirmed) return
    try {
      await userService.delete(user.id)
      navigate("/users")
    } catch {
      void MySwal.fire({
        icon: "error",
        title: "Lá»—i",
        text: "XoÃ¡ tháº¥t báº¡i",
        confirmButtonText: "ÄÃ³ng",
        confirmButtonColor: "var(--primary)",
      })
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return (
      <EmptyState
        title="KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"
        action={
          <button onClick={() => navigate("/users")} className="cursor-pointer rounded-lg border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Quay láº¡i
          </button>
        }
      />
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
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Chi tiáº¿t ngÆ°á»i dÃ¹ng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit() && (
            <button onClick={openFormDialog} className="flex items-center gap-2 rounded-lg border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              <Pencil size={15} />
              <span>Sá»­a</span>
            </button>
          )}
          {canEdit() && (
            <button onClick={confirmDelete} className="flex items-center gap-2 rounded-lg border border-red-200 bg-transparent px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
              <Trash2 size={15} />
              <span>XoÃ¡</span>
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
          <Field label="MÃ£ ngÆ°á»i dÃ¹ng" value={user.employeeCode || "â€”"} />
          <Field label="TÃªn Ä‘Äƒng nháº­p" value={user.username} />
          <Field label="Há» vÃ  tÃªn" value={user.name || "â€”"} />
          <Field label="Email" value={user.email || "â€”"} />
          <Field label="Sá»‘ Ä‘iá»‡n thoáº¡i" value={user.phone || "â€”"} />
          <Field label="NgÃ y vÃ o lÃ m" value={user.hireDate ? user.hireDate.slice(0, 10) : "â€”"} />
          <Field label="NgÃ y nghá»‰ viá»‡c" value={user.leaveDate ? user.leaveDate.slice(0, 10) : "â€”"} />
          <Field label="PhÃ²ng ban" value={deptNameMap.get(user.departmentId || "") || "â€”"} />
          <Field label="Chá»©c vá»¥" value={getPositionLabel(posNameMap.get(user.positionId || ""))} />
          <Field label="Loáº¡i tÃ i khoáº£n" value={user.role === "admin" ? "Admin" : "NgÆ°á»i dÃ¹ng"} />
          <Field label="Tráº¡ng thÃ¡i" value={user.status ? "Hoáº¡t Ä‘á»™ng" : "VÃ´ hiá»‡u"} />
          <Field label="NgÃ y táº¡o" value={new Date(user.createdAt).toLocaleString("vi-VN")} />
          <Field label="Cáº­p nháº­t cuá»‘i" value={new Date(user.updatedAt).toLocaleString("vi-VN")} />
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


