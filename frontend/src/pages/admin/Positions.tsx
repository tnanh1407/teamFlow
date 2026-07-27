import { useEffect, useState } from "react"
import { Search, Plus, Pencil, Trash2, ArrowUpDown, Medal } from "lucide-react"
import positionService, { type Position } from "@/services/position.service"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface FormData {
  name: string
  description: string
  level: string
}

const emptyForm: FormData = {
  name: "",
  description: "",
  level: "",
}

const levelLabels: Record<string, string> = {
  Intern: "Thực tập",
  Junior: "Junior",
  Middle: "Middle",
  Senior: "Senior",
  Leader: "Leader",
  Manager: "Manager",
}

export default function Positions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)
  const [levelOpen, setLevelOpen] = useState(false)

  const fetchPositions = async () => {
    try {
      const { data } = await positionService.getAll()
      setPositions(data.data)
    } catch {
      console.error("Failed to fetch positions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  const filtered = positions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.name.localeCompare(b.name)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (pos: Position) => {
    setEditingId(pos.id)
    setForm({
      name: pos.name,
      description: pos.description,
      level: pos.level,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload: any = { name: form.name, description: form.description || undefined }
      if (form.level) payload.level = form.level
      if (editingId) {
        await positionService.update(editingId, payload)
      } else {
        await positionService.create(payload)
      }
      setFormOpen(false)
      fetchPositions()
    } catch {
      console.error("Failed to save position")
    }
  }

  const confirmDelete = (pos: Position) => {
    setDeleteTarget(pos)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await positionService.delete(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchPositions()
    } catch {
      console.error("Failed to delete position")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const levelCount = (level: string) => positions.filter((p) => p.level === level).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản lí chức vụ
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý chức vụ và cấp bậc trong hệ thống
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Medal size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Tổng số</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{positions.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Medal size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Manager</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{levelCount("Manager")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Medal size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Junior / Intern</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{levelCount("Junior") + levelCount("Intern")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
            title="Thêm chức vụ"
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
            placeholder="Tìm kiếm theo tên chức vụ..."
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tên chức vụ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cấp bậc</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mô tả</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">Đang tải...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-400">Không tìm thấy chức vụ nào</td>
                </tr>
              ) : (
                sorted.map((pos) => (
                  <tr key={pos.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{pos.name}</td>
                    <td className="px-4 py-3">
                      {pos.level ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {levelLabels[pos.level] || pos.level}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-[250px] truncate">
                      {pos.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(pos)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none" title="Sửa">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => confirmDelete(pos)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none" title="Xoá">
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

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Sửa chức vụ" : "Thêm chức vụ"}
        width={420}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none">
              Huỷ
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none">
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Tên chức vụ</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Trưởng phòng" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cấp bậc</label>
            <div className="relative">
              <button type="button" onClick={() => setLevelOpen(!levelOpen)} className={`${inputClass} flex items-center justify-between text-left`}>
                <span className={form.level ? "text-zinc-900" : "text-zinc-400"}>{form.level ? levelLabels[form.level] : "Chọn cấp bậc"}</span>
              </button>
              {levelOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                  {(["Intern", "Junior", "Middle", "Senior", "Leader", "Manager"] as const).map((l) => (
                    <button key={l} type="button" onClick={() => { setForm({ ...form, level: l }); setLevelOpen(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.level === l ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"}`}>
                      {levelLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chức vụ (không bắt buộc)" rows={3} className={inputClass + " resize-none"} />
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
        Bạn có chắc muốn xoá chức vụ <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
