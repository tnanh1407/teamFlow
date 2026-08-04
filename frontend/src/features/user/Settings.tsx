import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import userService, { type User } from "@/services/user.service"

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Vui lòng nhập tên"),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const genderLabels: Record<ProfileFormValues["gender"], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
}

const inputClass =
  "block w-full rounded-lg border border-slate-200 bg-[#f7f8fc] px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
const labelClass = "mb-2 block text-sm font-medium text-slate-600"

function splitName(name?: string) {
  const cleaned = name?.trim() || ""
  if (!cleaned) return { firstName: "", lastName: "" }
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) || "" }
}

function combineName(firstName: string, lastName?: string) {
  return [firstName.trim(), lastName?.trim()].filter(Boolean).join(" ").trim()
}

export default function Settings() {
  const { user, setUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarURL || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "other",
    },
  })

  useEffect(() => {
    if (!user?.id) return

    const fetchDetails = async () => {
      try {
        const { data } = await userService.getById(user.id)
        const detail = data.data
        setProfileUser(detail)

        const nameParts = splitName(detail.name)
        reset({
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          email: detail.email || "",
          phone: detail.phone || "",
          birthDate: detail.birthDate ? detail.birthDate.slice(0, 10) : "",
          gender: detail.gender || "other",
        })
      } catch {
        toast.error("Không thể tải thông tin hồ sơ")
      }
    }

    fetchDetails()
  }, [reset, user?.id])

  useEffect(() => {
    setAvatarUrl(user?.avatarURL || null)
  }, [user?.avatarURL])

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB")
      return
    }

    setUploading(true)
    try {
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
      setAvatarFile(file)
    } catch {
      toast.error("Cập nhật ảnh thất bại")
      setAvatarPreview(null)
      setAvatarFile(null)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!profileUser) return

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("employeeCode", profileUser.employeeCode)
      fd.append("name", combineName(values.firstName, values.lastName))
      fd.append("email", values.email)
      fd.append("phone", values.phone || "")
      fd.append("departmentId", profileUser.departmentId || "")
      fd.append("positionId", profileUser.positionId || "")
      fd.append("gender", values.gender)
      fd.append("status", String(profileUser.status))
      fd.append("birthDate", values.birthDate || "")
      fd.append("hireDate", profileUser.hireDate || "")
      if (avatarFile) fd.append("avatar", avatarFile)

      await userService.update(profileUser.id, fd)
      toast.success("Cập nhật hồ sơ thành công")

      const empRes = await userService.getById(profileUser.id)
      const updated = empRes.data.data
      setProfileUser(updated)
      setUser((current) => (current ? { ...current, avatarURL: updated.avatarURL || current.avatarURL } : current))
      setAvatarUrl(updated.avatarURL || null)
      setAvatarPreview(null)
      setAvatarFile(null)

      const nameParts = splitName(updated.name)
      reset({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: updated.email || "",
        phone: updated.phone || "",
        birthDate: updated.birthDate ? updated.birthDate.slice(0, 10) : "",
        gender: updated.gender || "other",
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật hồ sơ thất bại")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Không tìm thấy thông tin người dùng</p>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Cài đặt</h1>
        <p className="mt-2 text-sm text-slate-500">Người dùng này chưa có dữ liệu hồ sơ.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] rounded-[32px] bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Cài đặt</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin cá nhân và ảnh đại diện của bạn.</p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="px-6 pb-8 pt-10 sm:px-10">
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-3xl flex-col items-center">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border-none bg-slate-100 text-slate-700 shadow-sm transition hover:scale-[1.02] disabled:cursor-not-allowed"
              >
                {avatarPreview || avatarUrl ? (
                  <img src={avatarPreview || avatarUrl || undefined} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <Camera size={28} className="text-slate-600" />
                )}
                <span className="absolute inset-0 rounded-full bg-black/0 transition group-hover:bg-black/5" />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 border-none bg-transparent text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                Upload Photo
              </button>

              <div className="mt-10 grid w-full grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input {...register("firstName")} placeholder="Enter your first name" className={inputClass} />
                  {errors.firstName?.message && <p className="mt-2 text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input {...register("lastName")} placeholder="Enter your last name" className={inputClass} />
                  {errors.lastName?.message && <p className="mt-2 text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Your email</label>
                  <input type="email" {...register("email")} placeholder="Enter your email" className={inputClass} />
                  {errors.email?.message && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input {...register("phone")} placeholder="Enter your phone number" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input {...register("birthDate")} type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <div className="relative">
                    <select {...register("gender")} className={`${inputClass} appearance-none pr-10`}>
                      {Object.entries(genderLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl border-none bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
