import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"
import { Search, Plus, Pencil, Trash2, ChevronDown, ArrowUpDown, Eye, Copy, Fingerprint } from "lucide-react"
import userService, { type User, type UserRole, type UserPosition } from "@/services/user.service"
import { useAuth } from "@/contexts/AuthContext"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"

interface FormData {
  employeeId: string
  username: string
  password: string
  position: UserPosition
  status: boolean
}

const emptyForm: FormData = {
  employeeId: "",
  username: "",
  password: "",
  position: "member",
  status: true,
}

const positionOptions: { value: UserPosition; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
]

const positionLabels: Record<UserPosition, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
}

function positionToRole(position: UserPosition): UserRole {
  return position === "admin" ? "admin" : "user"
}

function getPositionOptions(currentPosition: UserPosition): { value: UserPosition; label: string }[] {
  if (currentPosition === "admin") return positionOptions
  return [positionOptions[2]]
}

function getRoleBadge(position: UserPosition): { label: string; classes: string } {
  switch (position) {
    case "admin":
      return { label: "Admin", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }
    case "manager":
      return { label: "Manager", classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" }
    default:
      return { label: "Member", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
  }
}

export default function Members() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [positionOpen, setPositionOpen] = useState(false)
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchUsers = async () => {
    try {
      const { data } = await userService.getAll()
      setUsers(data.data)
    } catch {
      console.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.username.localeCompare(b.username)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const canEdit = (target: User): boolean => {
    if (!currentUser) return false
    if (currentUser.position === "admin") {
      if (target.id === currentUser.id) return false
      return true
    }
    return false
  }

  const canDelete = (target: User): boolean => {
    return canEdit(target)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowPassword(true)
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingId(user.id)
    setForm({
      employeeId: user.employeeId,
      username: user.username,
      password: "",
      position: user.position,
      status: user.status,
    })
    setShowPassword(false)
    setFormOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        const payload: any = {
          employeeId: form.employeeId,
          username: form.username,
          position: form.position,
          status: form.status,
        }
        if (form.password) payload.password = form.password
        await userService.update(editingId, payload)
      } else {
        await userService.create({
          ...form,
          employeeId: form.employeeId,
          password: form.password,
          role: positionToRole(form.position),
        })
      }
      setFormOpen(false)
      fetchUsers()
    } catch {
      console.error("Failed to save user")
    }
  }

  const confirmDelete = (user: User) => {
    setDeleteTarget(user)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await userService.delete(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchUsers()
    } catch {
      console.error("Failed to delete user")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const availablePositions = getPositionOptions(currentUser?.position ?? "member")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản lí thành viên
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const activeUsers = users.filter(u => u.status).length
          const inactiveUsers = users.filter(u => !u.status).length
          const adminCount = users.filter(u => u.position === "admin").length
          const managerCount = users.filter(u => u.position === "manager").length
          const memberCount = users.filter(u => u.position === "member").length
          const statusData = [
            { name: "Hoạt động", value: activeUsers, color: "#10b981" },
            { name: "Vô hiệu", value: inactiveUsers, color: "#ef4444" },
          ].filter(d => d.value > 0)
          const roleData = [
            { name: "Admin", value: adminCount, color: "#8b5cf6" },
            { name: "Manager", value: managerCount, color: "#06b6d4" },
            { name: "Member", value: memberCount, color: "#3b82f6" },
          ].filter(d => d.value > 0)
          const total = users.length || 1
          return (<>
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
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Vai trò</p>
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {roleData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col gap-2 pt-2">
                  {roleData.map((entry) => (
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
          </>)
        })()}
      </div>

      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
            title="Thêm thành viên"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={toggleSort}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-none hover:bg-white dark:hover:bg-zinc-800"
            title={
              sortDir === null ? "Sắp xếp A-Z" : sortDir === "asc" ? "Sắp xếp Z-A" : "Bỏ sắp xếp"
            }
          >
            <ArrowUpDown
              size={16}
              className={`transition-all duration-200 ${sortDir === "desc" ? "rotate-180" : ""
                } ${sortDir ? "text-blue-500" : "text-zinc-400"}`}
            />
            {sortDir && (
              <span className="text-zinc-600 dark:text-zinc-300">
                {sortDir === "asc" ? "A-Z" : "Z-A"}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập hoặc mã nhân viên..."
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">UUID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Avatar
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mã NV
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tên đăng nhập
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Không tìm thấy thành viên nào
                  </td>
                </tr>
              ) : (
                sorted.map((user) => {
                  const badge = getRoleBadge(user.position)
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                          <Fingerprint size={12} className="shrink-0" />
                          {user.id.slice(0, 8)}...
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(user.id)
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
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                          {user.avatarURL ? (
                            <img src={user.avatarURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                          {user.employeeId}
                          <button
                            onClick={() => { navigator.clipboard.writeText(user.employeeId) }}
                            className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                            title="Copy"
                          >
                            <Copy size={12} />
                          </button>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/members/${user.id}`)}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer border-none bg-transparent"
                        >
                          {user.username}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500 dark:text-red-400"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${user.status
                              ? "bg-emerald-500"
                              : "bg-red-500"
                              }`}
                          />
                          {user.status ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/members/${user.id}`)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          {canEdit(user) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(user) }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none"
                              title="Sửa"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete(user) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmDelete(user) }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none"
                              title="Xoá"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Sửa thành viên" : "Thêm thành viên"}
        width={420}
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none"
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none"
            >
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mã nhân viên</label>
            <input
              type="text"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="VD: NV001"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tên đăng nhập</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Mật khẩu {editingId && <span className="text-zinc-400 font-normal">(để trống nếu không đổi)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer border-none bg-transparent text-xs"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Vai trò</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPositionOpen(!positionOpen)}
                className={`${inputClass} flex items-center justify-between`}
              >
                <span>{positionLabels[form.position]}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              {positionOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                  {availablePositions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, position: r.value })
                        setPositionOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.position === r.value ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                        }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="status"
              checked={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.checked })}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-sm text-zinc-700 cursor-pointer">
              Kích hoạt
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá"
        variant="warning"
        confirmText="Xoá"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn xoá thành viên{" "}
        <strong>{deleteTarget?.username}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
