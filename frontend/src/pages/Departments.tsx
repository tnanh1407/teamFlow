import { useEffect, useState } from "react"
import { Search, Plus, Pencil, Trash2, ChevronDown, ArrowUpDown, Building2, CheckCircle, XCircle, FileText, Copy } from "lucide-react"
import departmentService, { type Department } from "@/services/department.service"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface FormData {
  name: string
  code: string
  description: string
  isActive: boolean
}

const emptyForm: FormData = {
  name: "",
  code: "",
  description: "",
  isActive: true,
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.getAll()
      setDepartments(data.data)
    } catch {
      console.error("Failed to fetch departments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
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

  const openEdit = (department: Department) => {
    setEditingId(department.id)
    setForm({
      name: department.name,
      code: department.code,
      description: department.description,
      isActive: department.isActive,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await departmentService.update(editingId, form)
      } else {
        await departmentService.create(form)
      }
      setFormOpen(false)
      fetchDepartments()
    } catch {
      console.error("Failed to save department")
    }
  }

  const confirmDelete = (department: Department) => {
    setDeleteTarget(department)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await departmentService.delete(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchDepartments()
    } catch {
      console.error("Failed to delete department")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const activeCount = departments.filter((d) => d.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản lí phòng ban
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý phòng ban trong hệ thống
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Tổng số</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{departments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Đang hoạt động</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <XCircle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Vô hiệu</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{departments.length - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
            title="Thêm phòng ban"
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
              className={`transition-all duration-200 ${
                sortDir === "desc" ? "rotate-180" : ""
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
            placeholder="Tìm kiếm theo tên hoặc mã phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mã PB
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tên phòng ban
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mô tả
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
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Không tìm thấy phòng ban nào
                  </td>
                </tr>
              ) : (
                sorted.map((department) => (
                  <tr
                    key={department.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                        {department.code}
                        <button
                          onClick={() => { navigator.clipboard.writeText(department.code) }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-zinc-400 shrink-0" />
                        {department.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="shrink-0" />
                        <span>{department.description || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          department.isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            department.isActive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {department.isActive ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(department)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(department)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none"
                          title="Xoá"
                        >
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

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Sửa phòng ban" : "Thêm phòng ban"}
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
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 rounded-lg transition cursor-pointer border-none"
            >
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mã phòng ban</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="VD: IT, HR, SALES"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tên phòng ban</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nhập tên phòng ban"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả phòng ban (không bắt buộc)"
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="status"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-sm text-zinc-700 cursor-pointer">
              Kích hoạt
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá"
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn xoá phòng ban{" "}
        <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
