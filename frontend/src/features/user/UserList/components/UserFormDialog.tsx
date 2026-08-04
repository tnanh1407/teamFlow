import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type User } from "@/services/user.service"
import type { Department } from "@/services/department.service"
import type { Position } from "@/services/position.service"
import { MySwal } from "@/lib/swal"

type OpenUserFormDialogParams = {
  editingUser?: User
  departments: Department[]
  positions: Position[]
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

type OpenUserFormDialogResult =
  | { submitted: false; changed: false }
  | { submitted: true; changed: true }

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
  status: true,
}

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

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
    status: user.status,
  }
}

function normalizeComparable(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function normalizePayloadValue(value: unknown) {
  if (typeof value !== "string") return undefined
  return normalizeComparable(value)
}

function isSameEditPayload(editingUser: User, payload: Record<string, unknown>) {
  return (
    normalizePayloadValue(payload.employeeCode) === normalizeComparable(editingUser.employeeCode) &&
    normalizePayloadValue(payload.name) === normalizeComparable(editingUser.name) &&
    normalizePayloadValue(payload.email) === normalizeComparable(editingUser.email) &&
    normalizePayloadValue(payload.phone) === normalizeComparable(editingUser.phone) &&
    normalizePayloadValue(payload.birthDate) === normalizeComparable(editingUser.birthDate || undefined) &&
    normalizePayloadValue(payload.hireDate) === normalizeComparable(editingUser.hireDate || undefined) &&
    normalizePayloadValue(payload.leaveDate) === normalizeComparable(editingUser.leaveDate || undefined) &&
    String(payload.gender ?? "") === editingUser.gender &&
    String(payload.departmentId ?? "") === editingUser.departmentId &&
    String(payload.positionId ?? "") === editingUser.positionId &&
    String(payload.username ?? "") === editingUser.username &&
    Boolean(payload.status) === editingUser.status
  )
}

export default async function openUserFormDialog({
  editingUser,
  departments,
  positions,
  onSubmit,
}: OpenUserFormDialogParams): Promise<OpenUserFormDialogResult | undefined> {
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
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId?.message && <p className="mt-1 text-xs text-red-500">{errors.departmentId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Chức vụ</label>
            <select {...register("positionId")} className={`${inputClass} appearance-none`}>
              <option value="">-- Chọn --</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.positionId?.message && <p className="mt-1 text-xs text-red-500">{errors.positionId.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Mật khẩu {isEdit && <span className="font-normal text-zinc-400">(để trống nếu không đổi)</span>}
            </label>
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

  const payload: Record<string, unknown> = {
    employeeCode: result.value.employeeCode,
    name: result.value.name,
    email: result.value.email,
    phone: result.value.phone,
    birthDate: result.value.birthDate || undefined,
    hireDate: result.value.hireDate || undefined,
    leaveDate: result.value.status ? undefined : result.value.leaveDate || undefined,
    gender: result.value.gender,
    departmentId: result.value.departmentId,
    positionId: result.value.positionId,
    username: result.value.username,
    status: result.value.status,
  }

  if (result.value.password?.trim()) payload.password = result.value.password

  if (isEdit && editingUser && isSameEditPayload(editingUser, payload)) {
    return { submitted: false, changed: false }
  }

  await onSubmit(payload)
  return { submitted: true, changed: true }
}
