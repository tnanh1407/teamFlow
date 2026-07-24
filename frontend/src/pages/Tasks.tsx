import { useEffect, useState } from "react"
import { Search, Plus, Pencil, Trash2, ArrowUpDown, CheckSquare, Calendar, Clock, Gauge } from "lucide-react"
import projectService, { type Project } from "@/services/project.service"
import Modal from "@/components/ui/Modal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useAuth } from "@/contexts/AuthContext"

interface FormData {
  title: string
  description: string
  priority: string
  status: string
  progress: number
  startDate: string
  dueDate: string
  estimatedHours: number
}

const emptyForm: FormData = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  progress: 0,
  startDate: "",
  dueDate: "",
  estimatedHours: 0,
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const statusColors: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const priorityLabels: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  critical: "Khẩn cấp",
}

const statusLabels: Record<string, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Đánh giá",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
}

export default function Tasks() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      const { data } = await projectService.getAll()
      setProjects(data.data)
    } catch {
      console.error("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.title.localeCompare(b.title)
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

  const openEdit = (project: Project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      description: project.description,
      priority: project.priority,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : "",
      estimatedHours: project.estimatedHours || 0,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        progress: form.progress,
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours || undefined,
      }
      if (editingId) {
        await projectService.update(editingId, payload)
      } else {
        payload.createdBy = user?.id || ""
        await projectService.create(payload)
      }
      setFormOpen(false)
      fetchProjects()
    } catch {
      console.error("Failed to save project")
    }
  }

  const confirmDelete = (project: Project) => {
    setDeleteTarget(project)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await projectService.delete(deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      console.error("Failed to delete project")
    }
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const todoCount = projects.filter((p) => p.status === "todo" || p.status === "in_progress").length
  const completedCount = projects.filter((p) => p.status === "completed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản lí project
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý công việc và dự án trong hệ thống
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Tổng số</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Clock size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Đang thực hiện</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{todoCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Gauge size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Hoàn thành</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{completedCount}</p>
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
            title="Thêm project"
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
            placeholder="Tìm kiếm project..."
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
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Hạn chót
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Không tìm thấy project nào
                  </td>
                </tr>
              ) : (
                sorted.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={14} className="text-zinc-400 shrink-0" />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {project.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          priorityColors[project.priority] || ""
                        }`}
                      >
                        {priorityLabels[project.priority] || project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[project.status] || ""
                        }`}
                      >
                        {statusLabels[project.status] || project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              project.progress === 100
                                ? "bg-emerald-500"
                                : project.progress > 0
                                ? "bg-blue-500"
                                : ""
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 w-8">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {project.dueDate ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <Calendar size={12} />
                          {new Date(project.dueDate).toLocaleDateString("vi-VN")}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(project)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(project)}
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
        title={editingId ? "Sửa project" : "Thêm project"}
        width={480}
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
            <label className={labelClass}>Tiêu đề</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nhập tiêu đề project"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả project (không bắt buộc)"
              rows={2}
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mức độ</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setPriorityOpen(!priorityOpen); setStatusOpen(false) }}
                  className={`${inputClass} flex items-center justify-between`}
                >
                  <span>{priorityLabels[form.priority] || form.priority}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      form.priority === "critical" ? "bg-red-500" :
                      form.priority === "high" ? "bg-orange-500" :
                      form.priority === "medium" ? "bg-blue-500" :
                      "bg-slate-400"
                    }`}
                  />
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                    {(["low", "medium", "high", "critical"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setForm({ ...form, priority: p }); setPriorityOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none flex items-center gap-2 ${
                          form.priority === p ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          p === "critical" ? "bg-red-500" :
                          p === "high" ? "bg-orange-500" :
                          p === "medium" ? "bg-blue-500" :
                          "bg-slate-400"
                        }`} />
                        {priorityLabels[p]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setStatusOpen(!statusOpen); setPriorityOpen(false) }}
                  className={`${inputClass} flex items-center justify-between`}
                >
                  <span>{statusLabels[form.status] || form.status}</span>
                </button>
                {statusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                    {(["todo", "in_progress", "review", "completed", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setForm({ ...form, status: s }); setStatusOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${
                          form.status === s ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Tiến độ: <span className="text-blue-600 font-bold">{form.progress}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ngày bắt đầu</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Ngày kết thúc</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Thời gian dự kiến (giờ)</label>
            <input
              type="number"
              min={0}
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })}
              placeholder="VD: 8"
              className={inputClass}
            />
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
        Bạn có chắc muốn xoá project{" "}
        <strong>{deleteTarget?.title}</strong>? Hành động này không thể hoàn tác.
      </ConfirmDialog>
    </div>
  )
}
