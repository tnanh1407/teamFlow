import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { type User } from "@/services/user.service"
import type { Department } from "@/services/department.service"
import type { Position } from "@/services/position.service"
import { MySwal } from "@/lib/swal"
import { getPositionLabel, isLeaderPosition } from "@/shared/utils/position"

type OpenUserFormEditDialogParams = {
  editingUser: User
  departments: Department[]
  positions: Position[]
  canEditEmployeeCode: boolean
  onSubmit: (payload: Record<string, unknown> | FormData) => Promise<void>
}

type OpenUserFormEditDialogResult =
  | { submitted: false; changed: false }
  | { submitted: true; changed: true }

interface UserEditFormValues {
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

function generateEmployeeSuffix(length = 6) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let suffix = ""
  for (let index = 0; index < length; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return suffix
}

function buildEmployeeCode(departmentCode: string) {
  return `${departmentCode.trim().toUpperCase()}${generateEmployeeSuffix()}`
}

function parseDateOnly(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null
}

function addEmploymentDateIssues(
  data: Pick<UserEditFormValues, "birthDate" | "hireDate" | "leaveDate">,
  ctx: z.RefinementCtx,
) {
  const birthDate = parseDateOnly(data.birthDate)
  const hireDate = parseDateOnly(data.hireDate)
  const leaveDate = parseDateOnly(data.leaveDate)

  if (data.birthDate && !birthDate) {
    ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Ngày sinh không hợp lệ" })
  }
  if (data.hireDate && !hireDate) {
    ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Ngày tuyển dụng không hợp lệ" })
  }
  if (data.leaveDate && !leaveDate) {
    ctx.addIssue({ code: "custom", path: ["leaveDate"], message: "Ngày nghỉ việc không hợp lệ" })
  }

  if (birthDate && hireDate) {
    const minimumHireDate = new Date(birthDate)
    minimumHireDate.setUTCFullYear(minimumHireDate.getUTCFullYear() + 18)
    if (hireDate < birthDate) {
      ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Ngày tuyển dụng không được trước ngày sinh" })
    } else if (hireDate < minimumHireDate) {
      ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Ngày tuyển dụng phải cách ngày sinh ít nhất 18 năm" })
    }
  }

  if (hireDate && leaveDate && leaveDate < hireDate) {
    ctx.addIssue({ code: "custom", path: ["leaveDate"], message: "Ngày nghỉ việc không được trước ngày tuyển dụng" })
  }
}

function buildEditUserSchema(departments: Department[], positions: Position[], allowAdminEmptyFields: boolean) {
  const departmentCodeMap = new Map(departments.map((department) => [department.id, department.code.trim().toUpperCase()] as const))
  const positionNameMap = new Map(positions.map((position) => [position.id, position.name.trim().toLowerCase()] as const))

  return z
    .object({
      employeeCode: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lòng nhập mã nhân viên"),
      name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
      email: z.string().trim().email("Email không hợp lệ"),
      phone: z.string().trim().optional(),
      birthDate: z.string().optional(),
      hireDate: z.string().optional(),
      leaveDate: z.string().optional(),
      gender: z.enum(["male", "female", "other"]),
      departmentId: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lòng chọn phòng ban"),
      positionId: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lòng chọn chức vụ"),
      username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
      password: z.string().optional(),
      status: z.boolean(),
    })
    .superRefine((data, ctx) => {
      addEmploymentDateIssues(data, ctx)
      const employeeCode = (data.employeeCode ?? "").trim().toUpperCase()
      const departmentId = data.departmentId?.trim() || ""
      const positionId = data.positionId?.trim() || ""
      const positionName = positionNameMap.get(positionId) ?? ""
      const isLeader = isLeaderPosition(positionName)

      if (allowAdminEmptyFields && !employeeCode && !departmentId) return

      if (isLeader && departmentId) {
        ctx.addIssue({
          code: "custom",
          path: ["departmentId"],
          message: "Trưởng bộ phận không được gắn phòng ban",
        })
        return
      }

      if (isLeader) return

      const departmentCode = departmentCodeMap.get(departmentId)
      if (!departmentCode) {
        if (allowAdminEmptyFields && !departmentId) return
        ctx.addIssue({
          code: "custom",
          path: ["departmentId"],
          message: "Vui lòng chọn phòng ban",
        })
        return
      }

      if (!employeeCode) {
        if (allowAdminEmptyFields) return
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: "Vui lòng nhập mã người dùng",
        })
        return
      }

      if (!employeeCode.startsWith(departmentCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: `Mã nhân viên phải bắt đầu bằng mã phòng ban ${departmentCode}`,
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

function toFormValues(user: User): UserEditFormValues {
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

function buildEditPayload(values: UserEditFormValues, avatarFile: File | null, avatarRemoved: boolean) {
  if (!avatarFile) {
    const payload: Record<string, unknown> = {
      employeeCode: values.employeeCode,
      name: values.name,
      email: values.email,
      phone: values.phone,
      birthDate: values.birthDate || undefined,
      hireDate: values.hireDate || undefined,
      leaveDate: values.status ? undefined : values.leaveDate || undefined,
      gender: values.gender,
      departmentId: values.departmentId,
      positionId: values.positionId,
      username: values.username,
      status: values.status,
    }

    if (values.password?.trim()) payload.password = values.password
    if (avatarRemoved) payload.avatarAction = "remove"
    return payload
  }

  const formData = new FormData()
  formData.append("employeeCode", values.employeeCode ?? "")
  formData.append("name", values.name)
  formData.append("email", values.email)
  formData.append("phone", values.phone ?? "")
  formData.append("birthDate", values.birthDate ?? "")
  formData.append("hireDate", values.hireDate ?? "")
  formData.append("leaveDate", values.status ? "" : values.leaveDate ?? "")
  formData.append("gender", values.gender)
  formData.append("departmentId", values.departmentId ?? "")
  formData.append("positionId", values.positionId ?? "")
  formData.append("username", values.username)
  formData.append("status", String(values.status))
  if (values.password?.trim()) formData.append("password", values.password)
  if (avatarRemoved) formData.append("avatarAction", "remove")
  formData.append("avatar", avatarFile)
  return formData
}

function normalizeComparable(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function normalizeDateComparable(value: unknown) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 10) : undefined
}

function normalizePayloadValue(value: unknown) {
  if (typeof value !== "string") return undefined
  return normalizeComparable(value)
}

function getPayloadValue(payload: Record<string, unknown> | FormData, key: string) {
  return payload instanceof FormData ? payload.get(key) : payload[key]
}

function isSameEditPayload(editingUser: User, payload: Record<string, unknown>) {
  return (
    normalizePayloadValue(payload.employeeCode) === normalizeComparable(editingUser.employeeCode) &&
    normalizePayloadValue(payload.name) === normalizeComparable(editingUser.name) &&
    normalizePayloadValue(payload.email) === normalizeComparable(editingUser.email) &&
    normalizePayloadValue(payload.phone) === normalizeComparable(editingUser.phone) &&
    normalizeDateComparable(payload.birthDate) === normalizeDateComparable(editingUser.birthDate) &&
    normalizeDateComparable(payload.hireDate) === normalizeDateComparable(editingUser.hireDate) &&
    normalizeDateComparable(payload.leaveDate) === normalizeDateComparable(editingUser.leaveDate) &&
    String(payload.gender ?? "") === editingUser.gender &&
    String(payload.departmentId ?? "") === editingUser.departmentId &&
    String(payload.positionId ?? "") === editingUser.positionId &&
    String(payload.username ?? "") === editingUser.username &&
    Boolean(payload.status) === editingUser.status
  )
}

export default async function openUserFormEditDialog({
  editingUser,
  departments,
  positions,
  canEditEmployeeCode,
  onSubmit,
}: OpenUserFormEditDialogParams): Promise<OpenUserFormEditDialogResult | undefined> {
  const dataRef: { current: UserEditFormValues | null } = { current: null }
  const validRef: { current: boolean } = { current: false }
  const avatarFileRef: { current: File | null } = { current: null }
  const avatarRemovedRef: { current: boolean } = { current: false }
  const formSchema = buildEditUserSchema(departments, positions, editingUser.role === "admin")

  function FormComponent() {
    const {
      register,
      watch,
      setValue,
      formState: { errors, isValid },
    } = useForm({
      resolver: zodResolver(formSchema),
      mode: "onChange",
      defaultValues: toFormValues(editingUser),
    })

    const values = watch()
    const departmentId = watch("departmentId")
    const employeeCode = watch("employeeCode")
    const previousDepartmentIdRef = useRef<string | undefined>(undefined)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState(editingUser.avatarURL || "")
    const [showPassword, setShowPassword] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement | null>(null)
    const selectedDepartment = departments.find((item) => item.id === departmentId)
    const departmentPrefix = selectedDepartment?.code.trim().toUpperCase() || "DEPT"
    const employeePlaceholder = departmentId ? `${departmentPrefix}ABC123` : "Chọn phòng ban trước"

    useEffect(() => {
      dataRef.current = values
    }, [values])

    useEffect(() => {
      if (!avatarFile) return
      avatarFileRef.current = avatarFile
      avatarRemovedRef.current = false
      const nextPreview = URL.createObjectURL(avatarFile)
      setAvatarPreview(nextPreview)
      return () => URL.revokeObjectURL(nextPreview)
    }, [avatarFile])

    useEffect(() => {
      if (!avatarFile) avatarFileRef.current = null
    }, [avatarFile])

    useEffect(() => {
      validRef.current = isValid
    }, [isValid])

    useEffect(() => {
      const selectedDepartmentId = departmentId?.trim() || ""
      const previousDepartmentId = previousDepartmentIdRef.current
      previousDepartmentIdRef.current = selectedDepartmentId

      if (!selectedDepartmentId) {
        setValue("employeeCode", "")
        return
      }

      const department = departments.find((item) => item.id === selectedDepartmentId)
      if (!department) return

      const departmentCode = department.code.trim().toUpperCase()
      const currentCode = (employeeCode ?? "").trim().toUpperCase()

      if (!currentCode) {
        setValue("employeeCode", buildEmployeeCode(departmentCode), { shouldDirty: true, shouldValidate: true })
        return
      }

      if (previousDepartmentId && previousDepartmentId !== selectedDepartmentId) {
        setValue("employeeCode", buildEmployeeCode(departmentCode), { shouldDirty: true, shouldValidate: true })
      }
    }, [departmentId, departments, employeeCode, setValue])

    return (
      <div className="space-y-5 text-left">
        <div className="rounded-2xl bg-muted/30 p-3 sm:p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 sm:flex-row sm:items-center">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-border bg-muted">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={editingUser.name} className="h-full w-full object-cover" />
                ) : (
                  <img src="/avatarDefault.png" alt="Ảnh đại diện mặc định" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Ảnh đại diện</p>
                <p className="text-xs text-muted-foreground">Tải ảnh mới hoặc xóa ảnh hiện tại.</p>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    avatarRemovedRef.current = false
                    setAvatarFile(file)
                  }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 inline-flex min-h-9 items-center rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Chọn ảnh
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null)
                      avatarRemovedRef.current = false
                      setAvatarPreview(editingUser.avatarURL || "")
                      if (avatarInputRef.current) avatarInputRef.current.value = ""
                    }}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                  >
                    Hủy ảnh mới
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    avatarRemovedRef.current = true
                    setAvatarFile(null)
                    setAvatarPreview("")
                    if (avatarInputRef.current) avatarInputRef.current.value = ""
                  }}
                  disabled={!avatarPreview && !editingUser.avatarURL}
                  className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Xóa ảnh hiện tại
                </button>
              </div>
            </div>

            <div className="border-t border-border/70 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thông tin tài khoản</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Mã nhân viên{canEditEmployeeCode ? " (Admin có thể sửa)" : ""}
              </label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    {...register("employeeCode", { setValueAs: (value) => (typeof value === "string" ? value.toUpperCase() : value) })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 pr-20 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    placeholder={employeePlaceholder}
                    readOnly={!canEditEmployeeCode}
                    aria-readonly={!canEditEmployeeCode}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!employeeCode) return
                      try {
                        await navigator.clipboard.writeText(employeeCode)
                        toast.success("Đã sao chép mã nhân viên")
                      } catch {
                        toast.error("Không thể sao chép mã nhân viên")
                      }
                    }}
                    disabled={!employeeCode}
                    className="absolute right-1 top-1 inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-card px-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Sao chép mã nhân viên"
                    title="Sao chép mã nhân viên"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {canEditEmployeeCode
                    ? "Đổi phòng ban sẽ sinh mã mới; mã sửa thủ công cần xác nhận."
                    : "Chọn phòng ban để hệ thống tự sinh mã nhân viên."}
                </p>
              </div>
              {errors.employeeCode?.message && <p className="mt-1 text-xs text-destructive">{errors.employeeCode.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tên đăng nhập</label>
                <input
                  {...register("username")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.username?.message && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 top-1 inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Để trống nếu không muốn đổi mật khẩu.</p>
              </div>
            </div>

            <div className="border-t border-border/70 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thông tin cá nhân</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Họ và tên</label>
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.name?.message && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.email?.message && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="border-t border-border/70 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thời gian làm việc</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Số điện thoại</label>
                <input
                  {...register("phone")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giới tính</label>
                <select
                  {...register("gender")}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="other">Khác</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngày sinh</label>
                <input
                  type="date"
                  lang="en-GB"
                  {...register("birthDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.birthDate?.message && <p className="mt-1 text-xs text-destructive">{errors.birthDate.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngày tuyển dụng</label>
                <input
                  type="date"
                  lang="en-GB"
                  {...register("hireDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.hireDate?.message && <p className="mt-1 text-xs text-destructive">{errors.hireDate.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-warning/30 bg-warning/5 p-3 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Ngày nghỉ việc</label>
                <input
                  type="date"
                  lang="en-GB"
                  {...register("leaveDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.leaveDate?.message && <p className="mt-1 text-xs text-destructive">{errors.leaveDate.message}</p>}
                <p className="text-xs text-muted-foreground">Chỉ điền khi muốn đánh dấu nhân sự đã nghỉ.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-muted/30 p-3 sm:p-4">
          <div className="mb-3 border-b border-border/70 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phân quyền và trạng thái</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phòng ban</label>
              <select
                {...register("departmentId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId?.message && <p className="mt-1 text-xs text-destructive">{errors.departmentId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Chức vụ</label>
              <select
                {...register("positionId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getPositionLabel(p.name)}
                  </option>
                ))}
              </select>
              {errors.positionId?.message && <p className="mt-1 text-xs text-destructive">{errors.positionId.message}</p>}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 sm:col-span-2">
              <input
                type="checkbox"
                {...register("status")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Kích hoạt tài khoản</p>
                <p className="text-xs text-muted-foreground">Bật nếu nhân sự đang hoạt động và có thể đăng nhập.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const result = await MySwal.fire({
    title: "Sửa người dùng",
    width: "min(96vw, 920px)",
    html: <FormComponent />,
    customClass: {
      popup: "swal-theme-popup user-edit-dialog-popup",
      title: "swal-theme-title",
      htmlContainer: "swal-theme-html user-edit-dialog-html",
      confirmButton: "swal-theme-confirm",
      cancelButton: "swal-theme-cancel",
      closeButton: "swal-theme-close",
    },
    showCloseButton: true,
    closeButtonAriaLabel: "Đóng",
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

  const nextPayload = buildEditPayload(result.value, avatarFileRef.current, avatarRemovedRef.current)

  const employeeCodeChanged =
    normalizePayloadValue(getPayloadValue(nextPayload, "employeeCode")) !==
    normalizeComparable(editingUser.employeeCode)

  if (canEditEmployeeCode && employeeCodeChanged) {
    const confirmation = await MySwal.fire({
      icon: "warning",
      title: "Xác nhận đổi mã nhân viên",
      text: "Mã nhân viên là dữ liệu định danh nghiệp vụ. Bạn có chắc muốn thay đổi mã này?",
      showCancelButton: true,
      confirmButtonText: "Xác nhận đổi mã",
      cancelButtonText: "Giữ mã cũ",
      reverseButtons: true,
    })

    if (!confirmation.isConfirmed) return
  }

  if (!avatarFileRef.current && !avatarRemovedRef.current && isSameEditPayload(editingUser, nextPayload as Record<string, unknown>)) {
    return { submitted: false, changed: false }
  }

  const confirmation = await MySwal.fire({
    icon: "question",
    title: "Xác nhận cập nhật",
    text: `Bạn có chắc muốn cập nhật thông tin của ${editingUser.name || editingUser.username}?`,
    showCancelButton: true,
    confirmButtonText: "Xác nhận cập nhật",
    cancelButtonText: "Hủy",
    reverseButtons: true,
  })

  if (!confirmation.isConfirmed) return

  await onSubmit(nextPayload)
  return { submitted: true, changed: true }
}




