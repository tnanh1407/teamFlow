import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import type { Department } from "@/services/department.service"
import type { Position } from "@/services/position.service"
import { MySwal } from "@/lib/swal"
import { getPositionLabel, isLeaderPosition } from "@/shared/utils/position"

type OpenUserFormDialogParams = {
  departments: Department[]
  positions: Position[]
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

type OpenUserFormDialogResult =
  | { submitted: false; changed: false }
  | { submitted: true; changed: true }

interface UserFormValues {
  employeeCode: string
  name: string
  email: string
  departmentId: string
  positionId: string
  username: string
  password: string
  status: boolean
}

const emptyForm: UserFormValues = {
  employeeCode: "",
  name: "",
  email: "",
  departmentId: "",
  positionId: "",
  username: "",
  password: "",
  status: false,
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

function buildUserSchema(departments: Department[], positions: Position[]) {
  const departmentCodeMap = new Map(
    departments.map((department) => [department.id, department.code.trim().toUpperCase()] as const),
  )
  const positionNameMap = new Map(
    positions.map((position) => [position.id, position.name.trim().toLowerCase()] as const),
  )

  return z
    .object({
      employeeCode: z.string().trim().min(1, "Vui lòng nhập mã nhân viên"),
      name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
      email: z.string().trim().email("Email không hợp lệ"),
      departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
      positionId: z.string().trim().min(1, "Vui lòng chọn chức vụ"),
      username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
      password: z.string().trim().min(1, "Vui lòng nhập mật khẩu"),
      status: z.boolean(),
    })
    .superRefine((data, ctx) => {
      const employeeCode = (data.employeeCode ?? "").trim().toUpperCase()
      const departmentId = data.departmentId?.trim() || ""
      const positionId = data.positionId?.trim() || ""
      const positionName = positionNameMap.get(positionId) ?? ""
      const isLeader = isLeaderPosition(positionName)

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
        ctx.addIssue({
          code: "custom",
          path: ["departmentId"],
          message: "Vui lòng chọn phòng ban",
        })
        return
      }

      if (!employeeCode) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: "Vui lòng nhập mã nhân viên",
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

export default async function openUserFormAddDialog({
  departments,
  positions,
  onSubmit,
}: OpenUserFormDialogParams): Promise<OpenUserFormDialogResult | undefined> {
  const dataRef: { current: UserFormValues | null } = { current: null }
  const validRef: { current: boolean } = { current: false }
  const formSchema = buildUserSchema(departments, positions)

  function FormComponent() {
    const {
      register,
      watch,
      setValue,
      formState: { errors, isValid },
    } = useForm<UserFormValues>({
      resolver: zodResolver(formSchema),
      mode: "onChange",
      defaultValues: emptyForm,
    })

    const values = watch()
    const departmentId = watch("departmentId")
    const employeeCode = watch("employeeCode")
    const previousDepartmentIdRef = useRef<string | undefined>(undefined)
    const selectedDepartment = departments.find((item) => item.id === departmentId)
    const departmentPrefix = selectedDepartment?.code.trim().toUpperCase() || "DEPT"
    const employeePlaceholder = departmentId ? `${departmentPrefix}ABC123` : "Chọn phòng ban trước"

    useEffect(() => {
      dataRef.current = values
    }, [values])

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
        setValue("employeeCode", buildEmployeeCode(departmentCode), {
          shouldDirty: true,
          shouldValidate: true,
        })
        return
      }

      if (previousDepartmentId && previousDepartmentId !== selectedDepartmentId) {
        setValue("employeeCode", buildEmployeeCode(departmentCode), {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    }, [departmentId, employeeCode, setValue])

    return (
      <div className="space-y-4 text-left">
        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Mã nhân viên
              </label>
              <div className="flex flex-col gap-2">
                <input
                  {...register("employeeCode", {
                    setValueAs: (value) =>
                      typeof value === "string" ? value.toUpperCase() : value,
                  })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  placeholder={employeePlaceholder}
                  readOnly
                  aria-readonly="true"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Chọn phòng ban để hệ thống tự sinh mã nhân viên.
                  </p>
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
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Sao chép mã nhân viên"
                    title="Sao chép mã nhân viên"
                  >
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
              {errors.employeeCode?.message && (
                <p className="mt-1 text-xs text-destructive">{errors.employeeCode.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Tên đăng nhập
                </label>
                <input
                  {...register("username")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.username?.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Họ và tên
                </label>
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.name?.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.email?.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Phòng ban
              </label>
              <select
                {...register("departmentId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn --</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.departmentId?.message && (
                <p className="mt-1 text-xs text-destructive">{errors.departmentId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Chức vụ
              </label>
              <select
                {...register("positionId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn --</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {getPositionLabel(position.name)}
                  </option>
                ))}
              </select>
              {errors.positionId?.message && (
                <p className="mt-1 text-xs text-destructive">{errors.positionId.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 sm:col-span-2">
              <input
                type="checkbox"
                {...register("status")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Kích hoạt tài khoản</p>
                <p className="text-xs text-muted-foreground">
                  Bật nếu nhân sự đang hoạt động và có thể đăng nhập.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const result = await MySwal.fire({
    title: "Thêm người dùng",
    width: "min(96vw, 640px)",
    html: <FormComponent />,
    showCloseButton: true,
    closeButtonAriaLabel: "Đóng",
    showCancelButton: true,
    confirmButtonText: "Tạo mới",
    cancelButtonText: "Hủy",
    reverseButtons: true,
    preConfirm: () => {
      const values = dataRef.current

      if (!values) {
        MySwal.showValidationMessage("Vui lòng nhập đầy đủ thông tin")
        return false
      }

      if (!validRef.current) {
        MySwal.showValidationMessage("Vui lòng kiểm tra lại các trường bắt buộc")
        return false
      }

      if (!values.password.trim()) {
        MySwal.showValidationMessage("Vui lòng nhập mật khẩu")
        return false
      }

      return values
    },
  })

  if (!result.isConfirmed || !result.value) return

  const payload: Record<string, unknown> = {
    employeeCode: result.value.employeeCode,
    name: result.value.name,
    email: result.value.email,
    departmentId: result.value.departmentId,
    positionId: result.value.positionId,
    username: result.value.username,
    status: result.value.status,
  }

  if (result.value.password.trim()) {
    payload.password = result.value.password
  }

  await onSubmit(payload)
  return { submitted: true, changed: true }
}
