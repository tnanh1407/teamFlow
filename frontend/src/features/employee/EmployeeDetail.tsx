import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2, Camera, Briefcase, Building2, Calendar, Phone, Mail, User } from "lucide-react"
import employeeService, { type Employee } from "@/services/employee.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import { useAuth } from "@/contexts/AuthContext"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

const genderLabels: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
}

const statusLabels: Record<string, string> = {
  active: "Đang làm",
  probation: "Thử việc",
  inactive: "Đã nghỉ",
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(false)
  const [posOpen, setPosOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)

  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    email: "",
    phone: "",
    departmentId: "",
    positionId: "",
    gender: "male",
    status: "active",
    birthDate: "",
    hireDate: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    if (!id) return
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        employeeService.getById(id),
        departmentService.getAll(),
        positionService.getAll(),
      ])
      const emp = empRes.data.data
      setEmployee(emp)
      setDepartments(deptRes.data.data)
      setPositions(posRes.data.data)
      setForm({
        employeeCode: emp.employeeCode,
        name: emp.name,
        email: emp.email,
        phone: emp.phone || "",
        departmentId: emp.departmentId,
        positionId: emp.positionId,
        gender: emp.gender,
        status: emp.status,
        birthDate: emp.birthDate ? emp.birthDate.slice(0, 10) : "",
        hireDate: emp.hireDate ? emp.hireDate.slice(0, 10) : "",
      })
      setExistingAvatar(emp.avatarURL || null)
    } catch {
      console.error("Failed to fetch employee")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const getDeptName = (depId: string) => departments.find((d) => d.id === depId)?.name || depId
  const getPosName = (posId: string) => positions.find((p) => p.id === posId)?.name || posId

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!employee) return
    try {
      const fd = new FormData()
      fd.append("employeeCode", form.employeeCode)
      fd.append("name", form.name)
      fd.append("email", form.email)
      if (form.phone) fd.append("phone", form.phone)
      fd.append("departmentId", form.departmentId)
      fd.append("positionId", form.positionId)
      fd.append("gender", form.gender)
      fd.append("status", form.status)
      if (form.birthDate) fd.append("birthDate", form.birthDate)
      if (form.hireDate) fd.append("hireDate", form.hireDate)
      if (avatarFile) fd.append("avatar", avatarFile)

      await employeeService.update(employee.id, fd)
      setEditOpen(false)
      fetchData()
    } catch {
      console.error("Failed to update employee")
    }
  }

  const handleDelete = async () => {
    if (!employee) return
    try {
      await employeeService.delete(employee.id)
      setDeleteOpen(false)
      navigate("/employees")
    } catch {
      console.error("Failed to delete employee")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const initials = employee?.name ? employee.name.slice(0, 2).toUpperCase() : "??"

  const isAdmin = currentUser?.position === "admin"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-zinc-500">Không tìm thấy nhân viên</p>
        <button
          onClick={() => navigate("/employees")}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/employees")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {employee.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Chi tiết nhân viên
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
            >
              <Pencil size={15} />
              <span>Sửa</span>
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer bg-transparent"
            >
              <Trash2 size={15} />
              <span>Xoá</span>
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-4 p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
            {employee.avatarURL ? (
              <img src={employee.avatarURL} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{employee.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                <Briefcase size={12} />
                {getPosName(employee.positionId)}
              </span>
              <span className="text-zinc-300">·</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                employee.status === "active" ? "text-emerald-600 dark:text-emerald-400" :
                employee.status === "probation" ? "text-amber-600 dark:text-amber-400" :
                "text-red-500 dark:text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  employee.status === "active" ? "bg-emerald-500" :
                  employee.status === "probation" ? "bg-amber-500" :
                  "bg-red-500"
                }`} />
                {statusLabels[employee.status] || employee.status}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mã nhân viên</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">{employee.employeeCode}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-400" />
                {employee.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số điện thoại</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Phone size={13} className="text-zinc-400" />
                {employee.phone || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phòng ban</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Building2 size={13} className="text-zinc-400" />
                {getDeptName(employee.departmentId)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chức vụ</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Briefcase size={13} className="text-zinc-400" />
                {getPosName(employee.positionId)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Giới tính</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <User size={13} className="text-zinc-400" />
                {genderLabels[employee.gender] || employee.gender}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ngày sinh</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-400" />
                {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("vi-VN") : "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ngày vào làm</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-400" />
                {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("vi-VN") : "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trạng thái</label>
              <span className={`mt-1 inline-flex items-center gap-1.5 text-sm font-medium ${
                employee.status === "active" ? "text-emerald-600 dark:text-emerald-400" :
                employee.status === "probation" ? "text-amber-600 dark:text-amber-400" :
                "text-red-500 dark:text-red-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  employee.status === "active" ? "bg-emerald-500" :
                  employee.status === "probation" ? "bg-amber-500" :
                  "bg-red-500"
                }`} />
                {statusLabels[employee.status] || employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Sửa nhân viên"
        width={520}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none">
              Huỷ
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none">
              Cập nhật
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : existingAvatar ? (
                <img src={existingAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera size={20} />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer border-none bg-transparent font-medium"
              >
                Chọn ảnh đại diện
              </button>
              <p className="text-xs text-zinc-400 mt-0.5">JPG, PNG, GIF, WEBP. Tối đa 5MB.</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarChange} className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mã nhân viên</label>
              <input type="text" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Họ tên</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phòng ban</label>
              <div className="relative">
                <button type="button" onClick={() => { setDeptOpen(!deptOpen); setPosOpen(false); setStatusOpen(false); setGenderOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span className={form.departmentId ? "text-zinc-900" : "text-zinc-400"}>{form.departmentId ? getDeptName(form.departmentId) : "Chọn phòng ban"}</span>
                </button>
                {deptOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {departments.map((d) => (
                      <button key={d.id} type="button" onClick={() => { setForm({ ...form, departmentId: d.id }); setDeptOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.departmentId === d.id ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                        {d.name} ({d.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Chức vụ</label>
              <div className="relative">
                <button type="button" onClick={() => { setPosOpen(!posOpen); setDeptOpen(false); setStatusOpen(false); setGenderOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span className={form.positionId ? "text-zinc-900" : "text-zinc-400"}>{form.positionId ? getPosName(form.positionId) : "Chọn chức vụ"}</span>
                </button>
                {posOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {positions.map((p) => (
                      <button key={p.id} type="button" onClick={() => { setForm({ ...form, positionId: p.id }); setPosOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.positionId === p.id ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Giới tính</label>
              <div className="relative">
                <button type="button" onClick={() => { setGenderOpen(!genderOpen); setDeptOpen(false); setPosOpen(false); setStatusOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span>{genderLabels[form.gender] || form.gender}</span>
                </button>
                {genderOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button key={g} type="button" onClick={() => { setForm({ ...form, gender: g }); setGenderOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.gender === g ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                        {genderLabels[g]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Trạng thái</label>
              <div className="relative">
                <button type="button" onClick={() => { setStatusOpen(!statusOpen); setDeptOpen(false); setPosOpen(false); setGenderOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span>{statusLabels[form.status] || form.status}</span>
                </button>
                {statusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                    {(["active", "probation", "inactive"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => { setForm({ ...form, status: s }); setStatusOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.status === s ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Ngày sinh</label>
              <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Ngày vào làm</label>
            <input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className={inputClass} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá"
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn xoá nhân viên <strong>{employee.name}</strong>? Nhân viên sẽ được chuyển vào thùng rác.
      </ConfirmDialog>
    </div>
  )
}