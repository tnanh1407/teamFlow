import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Pencil, Trash2, ArrowUpDown, Copy, Camera, Fingerprint } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import employeeService, { type Employee } from "@/services/employee.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import { toast } from "sonner"
import { MySwal, showDeleteConfirm } from "@/lib/swal"

interface FormData {
  employeeCode: string
  name: string
  email: string
  phone: string
  departmentId: string
  positionId: string
  gender: string
  status: string
  birthDate: string
  hireDate: string
}

const emptyForm: FormData = {
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
}

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

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeService.getAll()
      setEmployees(data.data)
    } catch {
      console.error("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.getAll()
      setDepartments(data.data)
    } catch { }
  }

  const fetchPositions = async () => {
    try {
      const { data } = await positionService.getAll()
      setPositions(data.data)
    } catch { }
  }

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchDepartments(), fetchPositions()])
  }, [])

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || id
  const getPosName = (id: string) => positions.find((p) => p.id === id)?.name || id

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.name.localeCompare(b.name)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const openFormDialog = async (editingEmp?: Employee) => {
    const isEdit = !!editingEmp
    const dataRef: {
      current: { f: FormData; avatarFile: File | null } | null
    } = { current: null }

    function FormComponent() {
      const [f, setF] = useState<FormData>(
        isEdit
          ? {
              employeeCode: editingEmp!.employeeCode,
              name: editingEmp!.name,
              email: editingEmp!.email,
              phone: editingEmp!.phone || "",
              departmentId: editingEmp!.departmentId,
              positionId: editingEmp!.positionId,
              gender: editingEmp!.gender,
              status: editingEmp!.status,
              birthDate: editingEmp!.birthDate ? editingEmp!.birthDate.slice(0, 10) : "",
              hireDate: editingEmp!.hireDate ? editingEmp!.hireDate.slice(0, 10) : "",
            }
          : { ...emptyForm }
      )
      const [avatarFile, setAvatarFile] = useState<File | null>(null)
      const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
      const [existingAvatar, setExistingAvatar] = useState<string | null>(
        editingEmp?.avatarURL || null
      )
      const fileInputRef = useRef<HTMLInputElement>(null)
      const [deptOpen, setDeptOpen] = useState(false)
      const [posOpen, setPosOpen] = useState(false)
      const [genderOpen, setGenderOpen] = useState(false)
      const [statusOpen, setStatusOpen] = useState(false)

      dataRef.current = { f, avatarFile }

      const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
          setAvatarFile(file)
          setAvatarPreview(URL.createObjectURL(file))
        }
      }

      return (
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mã nhân viên</label>
              <input type="text" value={f.employeeCode} onChange={(e) => setF({ ...f, employeeCode: e.target.value })} placeholder="VD: EMP011" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Họ tên</label>
              <input type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nhập họ tên" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="example@teamflow.com" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input type="text" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="090xxxxxxx" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phòng ban</label>
              <div className="relative">
                <button type="button" onClick={() => { setDeptOpen(!deptOpen); setPosOpen(false); setGenderOpen(false); setStatusOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span className={f.departmentId ? "text-zinc-900" : "text-zinc-400"}>{f.departmentId ? getDeptName(f.departmentId) : "Chọn phòng ban"}</span>
                </button>
                {deptOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {departments.map((d) => (
                      <button key={d.id} type="button" onClick={() => { setF({ ...f, departmentId: d.id }); setDeptOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${f.departmentId === d.id ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
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
                <button type="button" onClick={() => { setPosOpen(!posOpen); setDeptOpen(false); setGenderOpen(false); setStatusOpen(false) }} className={`${inputClass} flex items-center justify-between text-left`}>
                  <span className={f.positionId ? "text-zinc-900" : "text-zinc-400"}>{f.positionId ? getPosName(f.positionId) : "Chọn chức vụ"}</span>
                </button>
                {posOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {positions.map((p) => (
                      <button key={p.id} type="button" onClick={() => { setF({ ...f, positionId: p.id }); setPosOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${f.positionId === p.id ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
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
                  <span>{genderLabels[f.gender] || f.gender}</span>
                </button>
                {genderOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button key={g} type="button" onClick={() => { setF({ ...f, gender: g }); setGenderOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${f.gender === g ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
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
                  <span>{statusLabels[f.status] || f.status}</span>
                </button>
                {statusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                    {(["active", "probation", "inactive"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => { setF({ ...f, status: s }); setStatusOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${f.status === s ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Ngày sinh</label>
              <input type="date" value={f.birthDate} onChange={(e) => setF({ ...f, birthDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Ngày vào làm</label>
            <input type="date" value={f.hireDate} onChange={(e) => setF({ ...f, hireDate: e.target.value })} className={inputClass} />
          </div>
        </div>
      )
    }

    const result = await MySwal.fire({
      title: isEdit ? "Sửa nhân viên" : "Thêm nhân viên",
      width: 520,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Tạo mới",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: () => {
        const d = dataRef.current
        if (!d) return false
        if (!d.f.employeeCode.trim()) { MySwal.showValidationMessage("Vui lòng nhập mã nhân viên"); return false }
        if (!d.f.name.trim()) { MySwal.showValidationMessage("Vui lòng nhập họ tên"); return false }
        if (!d.f.email.trim()) { MySwal.showValidationMessage("Vui lòng nhập email"); return false }
        if (!d.f.departmentId) { MySwal.showValidationMessage("Vui lòng chọn phòng ban"); return false }
        if (!d.f.positionId) { MySwal.showValidationMessage("Vui lòng chọn chức vụ"); return false }
        return d
      },
    })

    if (result.isConfirmed && result.value) {
      const { f, avatarFile } = result.value
      const fd = new FormData()
      fd.append("employeeCode", f.employeeCode)
      fd.append("name", f.name)
      fd.append("email", f.email)
      if (f.phone) fd.append("phone", f.phone)
      fd.append("departmentId", f.departmentId)
      fd.append("positionId", f.positionId)
      fd.append("gender", f.gender)
      fd.append("status", f.status)
      if (f.birthDate) fd.append("birthDate", f.birthDate)
      if (f.hireDate) fd.append("hireDate", f.hireDate)
      if (avatarFile) fd.append("avatar", avatarFile)

      try {
        if (isEdit) {
          await employeeService.update(editingEmp!.id, fd)
          toast.success("Cập nhật thành công")
        } else {
          await employeeService.create(fd)
          toast.success("Tạo mới thành công")
        }
        fetchEmployees()
      } catch {
        toast.error("Lưu thất bại")
      }
    }
  }

  const openCreate = () => {
    openFormDialog()
  }

  const openEdit = (emp: Employee) => {
    openFormDialog(emp)
  }

  const confirmDelete = async (emp: Employee) => {
    const confirmed = await showDeleteConfirm({
      name: emp.name,
      html: `Bạn có chắc muốn xoá nhân viên <strong>${emp.name}</strong>? Nhân viên sẽ được chuyển vào thùng rác.`,
    })
    if (confirmed) {
      try {
        await employeeService.delete(emp.id)
        toast.success("Xoá thành công")
        fetchEmployees()
      } catch {
        toast.error("Xoá thất bại")
      }
    }
  }

  const activeCount = employees.filter((e) => e.status === "active").length
  const probationCount = employees.filter((e) => e.status === "probation").length
  const inactiveCount = employees.filter((e) => e.status === "inactive").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản lí Nhân Viên
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý thông tin nhân viên trong hệ thống
          </p>
        </div>
      </div>

      {(() => {
        const statusData = [
          { name: "Đang làm", value: activeCount, color: "#10b981" },
          { name: "Thử việc", value: probationCount, color: "#f59e0b" },
          { name: "Đã nghỉ", value: inactiveCount, color: "#ef4444" },
        ].filter(d => d.value > 0)
        const deptColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"]
        const deptData = departments.map((d, i) => ({
          name: d.name,
          value: employees.filter(e => e.departmentId === d.id).length,
          color: deptColors[i % deptColors.length],
        })).filter(d => d.value > 0)
        const total = employees.length || 1
        return (<>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Trạng thái</p>
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col gap-2 pt-2">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="group cursor-default">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.value}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(entry.value / total) * 100}%`, backgroundColor: entry.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Phòng ban</p>
            <div className="flex items-start gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {deptData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col gap-2 pt-2">
                {deptData.map((entry) => (
                  <div key={entry.name} className="group cursor-default">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.value}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(entry.value / total) * 100}%`, backgroundColor: entry.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </>)
      })()}

      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
            title="Thêm nhân viên"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={toggleSort}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-none hover:bg-white dark:hover:bg-zinc-800"
          >
            <ArrowUpDown size={16} className={`transition-all duration-200 ${sortDir === "desc" ? "rotate-180" : ""} ${sortDir ? "text-blue-500" : "text-zinc-400"}`} />
            {sortDir && (
              <span className="text-zinc-600 dark:text-zinc-300">
                {sortDir === "asc" ? "A-Z" : "Z-A"}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">UUID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mã NV</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Họ tên</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phòng ban</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chức vụ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">Đang tải...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">Không tìm thấy nhân viên nào</td>
                </tr>
              ) : (
                sorted.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                        <Fingerprint size={12} className="shrink-0" />
                        {emp.id.slice(0, 8)}...
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(emp.id)
                            toast.success("Đã sao chép UUID")
                          }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy UUID"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                        {emp.employeeCode}
                        <button
                          onClick={() => { navigator.clipboard.writeText(emp.employeeCode) }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {emp.avatarURL ? (
                            <img src={emp.avatarURL} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{emp.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <Link to={`/employees/${emp.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          {emp.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{emp.email}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">{getDeptName(emp.departmentId)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">{getPosName(emp.positionId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${emp.status === "active" ? "text-emerald-600 dark:text-emerald-400" :
                          emp.status === "probation" ? "text-amber-600 dark:text-amber-400" :
                            "text-red-500 dark:text-red-400"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" :
                            emp.status === "probation" ? "bg-amber-500" :
                              "bg-red-500"
                          }`} />
                        {statusLabels[emp.status] || emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(emp) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none" title="Sửa">
                          <Pencil size={15} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(emp) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none" title="Xoá">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
