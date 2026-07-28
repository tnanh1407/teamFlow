import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  User, Shield, Calendar, Save, Eye, EyeOff,
  Copy, CheckCircle, XCircle, Clock, Fingerprint, Lock, Camera,
  Mail, Phone, Building2, Briefcase
} from "lucide-react"
import { toast } from "sonner"
import userService from "@/services/user.service"
import employeeService, { type Employee } from "@/services/employee.service"
import departmentService from "@/services/department.service"
import positionService from "@/services/position.service"
import { MySwal } from "@/lib/swal"

const passwordChecks = (v: string) => ({
  min: v.length >= 6,
  upper: /[A-Z]/.test(v),
  lower: /[a-z]/.test(v),
  digit: /\d/.test(v),
  special: /[^A-Za-z0-9]/.test(v),
})

const strengthLabel = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]
const strengthColor = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"]

function getStrength(score: number) {
  return { label: strengthLabel[score], color: strengthColor[score], pct: (score + 1) * 20 }
}

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  member: "Thành viên",
}

const genderLabels: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
}

const statusLabels: Record<string, string> = {
  active: "Đang làm việc",
  probation: "Thử việc",
  inactive: "Đã nghỉ việc",
}

const positionBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  member: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
}

export default function Settings() {
  const { user, setUser } = useAuth()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [empLoading, setEmpLoading] = useState(false)
  const [deptName, setDeptName] = useState("—")
  const [posName, setPosName] = useState("—")

  useEffect(() => {
    if (!user?.employeeId) return
    const fetchEmployeeDetails = async () => {
      setEmpLoading(true)
      try {
        const [empRes, deptRes, posRes] = await Promise.all([
          employeeService.getById(user.employeeId),
          departmentService.getAll().catch(() => ({ data: { data: [] } })),
          positionService.getAll().catch(() => ({ data: { data: [] } })),
        ])
        const emp = empRes.data.data
        setEmployee(emp)
        if (emp?.departmentId) {
          const dept = deptRes.data.data.find((d: any) => d.id === emp.departmentId)
          if (dept) setDeptName(dept.name)
        }
        if (emp?.positionId) {
          const pos = posRes.data.data.find((p: any) => p.id === emp.positionId)
          if (pos) setPosName(pos.name)
        }
      } catch (err) {
        console.error("Failed to fetch linked employee data", err)
      } finally {
        setEmpLoading(false)
      }
    }
    fetchEmployeeDetails()
  }, [user?.employeeId])

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const initials = user?.username?.slice(0, 2).toUpperCase() || "TF"

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB")
      return
    }
    setUploading(true)
    try {
      const { data } = await userService.uploadAvatar(file)
      setUser(data.data)
      if (user?.employeeId) {
        const empRes = await employeeService.getById(user.employeeId)
        setEmployee(empRes.data.data)
      }
      toast.success("Cập nhật ảnh đại diện thành công")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật ảnh thất bại")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const openModal = () => {
    MySwal.fire({
      title: "Đổi mật khẩu",
      html: <PasswordForm />,
      showConfirmButton: false,
      showCancelButton: false,
    })
  }

  function PasswordForm() {
    const [showCur, setShowCur] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showCfm, setShowCfm] = useState(false)
    const [curPw, setCurPw] = useState("")
    const [newPw, setNewPw] = useState("")
    const [cfmPw, setCfmPw] = useState("")
    const [saving, setSaving] = useState(false)

    const checks = passwordChecks(newPw)
    const score = [checks.min, checks.upper, checks.lower, checks.digit, checks.special].filter(Boolean).length - 1
    const strength = getStrength(score)
    const pwMatch = cfmPw.length === 0 || newPw === cfmPw

    const handleSubmit = async () => {
      if (!curPw || !newPw || !cfmPw) { toast.error("Vui lòng điền đầy đủ thông tin"); return }
      if (newPw.length < 6) { toast.error("Mật khẩu mới phải có ít nhất 6 ký tự"); return }
      if (newPw !== cfmPw) { toast.error("Mật khẩu xác nhận không khớp"); return }
      setSaving(true)
      try {
        await userService.updateMe({ currentPassword: curPw, newPassword: newPw })
        toast.success("Đổi mật khẩu thành công")
        MySwal.close()
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại")
      } finally {
        setSaving(false)
      }
    }

    return (
      <div className="space-y-3" onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}>
        <div>
          <label className={labelClass}>Mật khẩu hiện tại</label>
          <div className="relative">
            <input type={showCur ? "text" : "password"} value={curPw} onChange={(e) => setCurPw(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại" className={inputClass + " pr-9"} autoComplete="current-password" />
            <button type="button" onClick={() => setShowCur(!showCur)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer border-none bg-transparent p-0.5">
              {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Mật khẩu mới</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
              placeholder="Nhập mật khẩu mới" className={inputClass + " pr-9"} autoComplete="new-password" />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer border-none bg-transparent p-0.5">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {newPw.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                </div>
                <span className="text-[11px] font-medium text-zinc-400 w-16 text-right shrink-0">{strength.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  { ok: checks.min, text: "Ít nhất 6 ký tự" },
                  { ok: checks.upper, text: "Chữ hoa (A-Z)" },
                  { ok: checks.lower, text: "Chữ thường (a-z)" },
                  { ok: checks.digit, text: "Chữ số (0-9)" },
                  { ok: checks.special, text: "Ký tự đặc biệt" },
                ].map((c) => (
                  <div key={c.text} className={`flex items-center gap-1.5 text-[11px] ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                    {c.ok ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {c.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Xác nhận mật khẩu</label>
          <div className="relative">
            <input type={showCfm ? "text" : "password"} value={cfmPw} onChange={(e) => setCfmPw(e.target.value)}
              placeholder="Nhập lại mật khẩu mới" className={inputClass + " pr-9"} autoComplete="new-password" />
            <button type="button" onClick={() => setShowCfm(!showCfm)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer border-none bg-transparent p-0.5">
              {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {cfmPw.length > 0 && !pwMatch && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <XCircle size={12} /> Mật khẩu xác nhận không khớp
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => MySwal.close()}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={saving || !curPw || !newPw || !cfmPw || !pwMatch}
            className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={15} />
            {saving ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cài đặt</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="relative w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden cursor-pointer border-none group">
            {user?.avatarURL ? (
              <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {uploading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Camera size={16} />
              )}
            </div>
          </button>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.username}</h2>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${positionBadge[user?.position || "member"]}`}>
              <Shield size={11} className="mr-1" />
              {roleLabel[user?.position || "member"]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <InfoRow icon={Fingerprint} label="ID Tài khoản" value={user?.id || "—"} copy />
          <InfoRow icon={User} label="Tên đăng nhập" value={user?.username || "—"} />
          <InfoRow icon={Shield} label="Quyền hệ thống (Role)" value={user?.role || "—"} />
          <InfoRow icon={Shield} label="Cấp độ tài khoản" value={roleLabel[user?.position || "member"]} />
          <InfoRow icon={Calendar} label="Ngày tạo tài khoản" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"} />
          <InfoRow
            icon={user?.status ? CheckCircle : XCircle}
            label="Trạng thái tài khoản"
            value={user?.status ? "Hoạt động" : "Vô hiệu"}
            valueClass={user?.status ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}
          />
        </div>

        {/* Thông tin nhân viên liên kết */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Thông tin nhân viên liên kết</h3>
          </div>

          {empLoading ? (
            <div className="py-4 text-center text-xs text-zinc-400">Đang tải thông tin hồ sơ nhân viên...</div>
          ) : employee ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <InfoRow icon={Fingerprint} label="Mã nhân viên" value={employee.employeeCode || "—"} copy />
              <InfoRow icon={User} label="Họ và tên" value={employee.name || "—"} />
              <InfoRow icon={Mail} label="Email nhân viên" value={employee.email || "—"} />
              <InfoRow icon={Phone} label="Số điện thoại" value={employee.phone || "—"} />
              <InfoRow icon={Building2} label="Phòng ban" value={deptName} />
              <InfoRow icon={Briefcase} label="Chức vụ chuyên môn" value={posName} />
              <InfoRow icon={User} label="Giới tính" value={genderLabels[employee.gender] || employee.gender || "—"} />
              <InfoRow icon={Calendar} label="Ngày sinh" value={employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("vi-VN") : "—"} />
              <InfoRow icon={Calendar} label="Ngày vào làm" value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("vi-VN") : "—"} />
              <InfoRow
                icon={employee.status === "active" ? CheckCircle : employee.status === "probation" ? Clock : XCircle}
                label="Trạng thái làm việc"
                value={statusLabels[employee.status] || employee.status}
                valueClass={
                  employee.status === "active"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : employee.status === "probation"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-500"
                }
              />
            </div>
          ) : (
            <div className="py-3 px-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs">
              Chưa tìm thấy thông tin hồ sơ nhân viên liên kết với tài khoản này.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
          <button onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none">
            <Lock size={15} />
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, copy, valueClass }: {
  icon: any; label: string; value: string; copy?: boolean; valueClass?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-600 mb-1">{label}</label>
      <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-1.5 min-h-[34px]">
        <Icon size={14} className="text-zinc-400 shrink-0" />
        <span className={`truncate flex-1 ${valueClass || ""}`}>{value}</span>
        {copy && (
          <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Đã sao chép ID") }}
            className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer border-none bg-transparent shrink-0" title="Copy ID">
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
