import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { type User } from "@/services/user.service"
import type { Department } from "@/services/department.service"
import type { Position } from "@/services/position.service"
import { MySwal } from "@/lib/swal"

type OpenUserFormEditDialogParams = {
  editingUser: User
  departments: Department[]
  positions: Position[]
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

function buildEditUserSchema(departments: Department[], positions: Position[], allowAdminEmptyFields: boolean) {
  const departmentCodeMap = new Map(departments.map((department) => [department.id, department.code.trim().toUpperCase()] as const))
  const positionNameMap = new Map(positions.map((position) => [position.id, position.name.trim().toLowerCase()] as const))

  return z
    .object({
      employeeCode: allowAdminEmptyFields ? z.string().trim().optional() : z.string().trim().min(1, "Vui lÃ²ng nháº­p mÃ£ nhÃ¢n viÃªn"),
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
      const positionId = data.positionId?.trim() || ""
      const positionName = positionNameMap.get(positionId) ?? ""
      const isLeader = positionName.includes("leader")

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
          message: "Vui lÃ²ng nháº­p mÃ£ ngÆ°á»i dÃ¹ng",
        })
        return
      }

      if (!employeeCode.startsWith(departmentCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["employeeCode"],
          message: `MÃ£ nhÃ¢n viÃªn pháº£i báº¯t Ä‘áº§u báº±ng mÃ£ phÃ²ng ban ${departmentCode}`,
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

export default async function openUserFormEditDialog({
  editingUser,
  departments,
  positions,
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
    const avatarInputRef = useRef<HTMLInputElement | null>(null)
    const selectedDepartment = departments.find((item) => item.id === departmentId)
    const departmentPrefix = selectedDepartment?.code.trim().toUpperCase() || "DEPT"
    const employeePlaceholder = departmentId ? `${departmentPrefix}ABC123` : "Chá»n phÃ²ng ban trÆ°á»›c"

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
      <div className="space-y-4 text-left">
        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 sm:flex-row sm:items-center">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-border bg-muted">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={editingUser.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                    {editingUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">áº¢nh Ä‘áº¡i diá»‡n</p>
                <p className="text-xs text-muted-foreground">Táº£i áº£nh má»›i hoáº·c xÃ³a áº£nh hiá»‡n táº¡i.</p>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    avatarRemovedRef.current = false
                    setAvatarFile(file)
                  }}
                />
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
                    Há»§y áº£nh má»›i
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
                  XÃ³a áº£nh hiá»‡n táº¡i
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">MÃ£ nhÃ¢n viÃªn</label>
              <div className="flex flex-col gap-2">
                <input
                  {...register("employeeCode", { setValueAs: (value) => (typeof value === "string" ? value.toUpperCase() : value) })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  placeholder={employeePlaceholder}
                  readOnly
                  aria-readonly="true"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Chá»n phÃ²ng ban Ä‘á»ƒ há»‡ thá»‘ng tá»± sinh mÃ£ nhÃ¢n viÃªn.</p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!employeeCode) return
                      try {
                        await navigator.clipboard.writeText(employeeCode)
                        toast.success("ÄÃ£ sao chÃ©p mÃ£ nhÃ¢n viÃªn")
                      } catch {
                        toast.error("KhÃ´ng thá»ƒ sao chÃ©p mÃ£ nhÃ¢n viÃªn")
                      }
                    }}
                    disabled={!employeeCode}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Sao chÃ©p mÃ£ nhÃ¢n viÃªn"
                    title="Sao chÃ©p mÃ£ nhÃ¢n viÃªn"
                  >
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
              {errors.employeeCode?.message && <p className="mt-1 text-xs text-destructive">{errors.employeeCode.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">TÃªn Ä‘Äƒng nháº­p</label>
                <input
                  {...register("username")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                {errors.username?.message && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Máº­t kháº©u má»›i</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Äá»ƒ trá»‘ng náº¿u khÃ´ng muá»‘n Ä‘á»•i máº­t kháº©u.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Há» vÃ  tÃªn</label>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                <input
                  {...register("phone")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giá»›i tÃ­nh</label>
                <select
                  {...register("gender")}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="other">KhÃ¡c</option>
                  <option value="male">Nam</option>
                  <option value="female">Ná»¯</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">NgÃ y sinh</label>
                <input
                  type="date"
                  {...register("birthDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">NgÃ y tuyá»ƒn dá»¥ng</label>
                <input
                  type="date"
                  {...register("hireDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">NgÃ y nghá»‰ viá»‡c</label>
                <input
                  type="date"
                  {...register("leaveDate")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Chá»‰ Ä‘iá»n khi muá»‘n Ä‘Ã¡nh dáº¥u nhÃ¢n sá»± Ä‘Ã£ nghá»‰.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">PhÃ²ng ban</label>
              <select
                {...register("departmentId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chá»n --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId?.message && <p className="mt-1 text-xs text-destructive">{errors.departmentId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Chá»©c vá»¥</label>
              <select
                {...register("positionId")}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chá»n --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                <p className="text-sm font-medium text-foreground">KÃ­ch hoáº¡t tÃ i khoáº£n</p>
                <p className="text-xs text-muted-foreground">Báº­t náº¿u nhÃ¢n sá»± Ä‘ang hoáº¡t Ä‘á»™ng vÃ  cÃ³ thá»ƒ Ä‘Äƒng nháº­p.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const result = await MySwal.fire({
    title: "Sá»­a ngÆ°á»i dÃ¹ng",
    width: "min(96vw, 760px)",
    html: <FormComponent />,
    showCloseButton: true,
    closeButtonAriaLabel: "ÄÃ³ng",
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

  const nextPayload = buildEditPayload(result.value, avatarFileRef.current, avatarRemovedRef.current)

  if (!avatarFileRef.current && !avatarRemovedRef.current && isSameEditPayload(editingUser, nextPayload as Record<string, unknown>)) {
    return { submitted: false, changed: false }
  }

  await onSubmit(nextPayload)
  return { submitted: true, changed: true }
}




