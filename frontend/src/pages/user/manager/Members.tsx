import { useEffect, useState } from "react"
import { Search, Plus, Pencil, Trash2, ChevronDown, Copy } from "lucide-react"
import userService, { type User, type UserRole, type UserPosition } from "@/services/user.service"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

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

function getRoleBadge(position: UserPosition): { label: string; classes: string } {
  switch (position) {
    case "admin":
      return { label: "Admin", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" }
    case "manager":
      return { label: "Manager", classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" }
    case "member":
      return { label: "Member", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
    default:
      return { label: "Member", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" }
  }
}

export default function ManagerMembers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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

  const members = users.filter((u) => u.position === "member")

  const filtered = members.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(search.toLowerCase())
  )

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
          employeeId: form.employeeId,
          username: form.username,
          password: form.password,
          position: form.position,
          role: "user" as UserRole,
          status: form.status,
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

  const inputClass = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Quản lí thành viên</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Quản lý tài khoản thành viên trong hệ thống</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none">
          <Plus size={16} /> Thêm thành viên
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Tìm kiếm thành viên..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avatar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mã NV</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tên đăng nhập</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Không tìm thấy thành viên nào</td></tr>
              ) : (
                filtered.map((u) => {
                  const badge = getRoleBadge(u.position)
                  return (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                          {u.avatarURL ? (
                            <img src={u.avatarURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                          {u.employeeId}
                          <button onClick={() => { navigator.clipboard.writeText(u.employeeId); void 0 }} className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent" title="Copy"><Copy size={12} /></button>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {u.username}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.classes}`}>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${u.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                          {u.status ? "Hoạt động" : "Đã khoá"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none" title="Sửa"><Pencil size={15} /></button>
                          <button onClick={() => confirmDelete(u)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none" title="Xoá"><Trash2 size={15} /></button>
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

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? "Sửa thành viên" : "Thêm thành viên"} width={420}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none">Huỷ</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none">
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mã nhân viên</label>
            <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="VD: NV001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tên đăng nhập</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Nhập tên đăng nhập" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mật khẩu {editingId && <span className="text-zinc-400 font-normal">(để trống nếu không đổi)</span>}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "Để trống nếu không đổi" : "Nhập mật khẩu"} className={inputClass} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer border-none bg-transparent text-xs">
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Vai trò</label>
            <div className="relative">
              <button type="button" disabled className={`${inputClass} flex items-center justify-between opacity-70`}>
                <span>Member</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="status" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="status" className="text-sm text-zinc-700 cursor-pointer">Kích hoạt</label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Xác nhận xoá" variant="warning" confirmText="Xoá" cancelText="Huỷ">
        Bạn có chắc muốn xoá thành viên <strong>{deleteTarget?.username}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
