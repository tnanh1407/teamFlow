import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Trash2, ArrowUpDown, CheckSquare, Calendar, Paperclip, X, File, FileImage, Download, Eye, Copy, Fingerprint } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import projectService, { type Project, type FileAttachment } from "@/services/project.service"
import uploadService from "@/services/upload.service"
import { MySwal, showDeleteConfirm } from "@/lib/swal"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

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

function getFileIcon(mimetype: string) {
  if (mimetype.startsWith("image/")) return FileImage
  return File
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export default function Projects() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchProjects = async () => {
    try {
      const { data } = user?.role === "admin"
        ? await projectService.getAll()
        : await projectService.getMyProjects()
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

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.title.localeCompare(b.title)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const openCreate = () => {
    openFormDialog(null)
  }

  const confirmDelete = async (project: Project) => {
    const confirmed = await showDeleteConfirm({
      name: project.title,
    })
    if (!confirmed) return
    try {
      await projectService.delete(project.id)
      fetchProjects()
      toast.success("Đã xoá project")
    } catch {
      toast.error("Xoá thất bại")
    }
  }

  const openFormDialog = (editingProject: Project | null) => {
    const editingId = editingProject?.id ?? null
    const initialForm: FormData = editingProject
      ? {
          title: editingProject.title,
          description: editingProject.description || "",
          priority: editingProject.priority,
          status: editingProject.status,
          progress: editingProject.progress,
          startDate: editingProject.startDate || "",
          dueDate: editingProject.dueDate || "",
          estimatedHours: editingProject.estimatedHours || 0,
        }
      : { ...emptyForm }

    let initialAttachments: FileAttachment[] = []
    try {
      const parsed = JSON.parse(editingProject?.attachments || "[]")
      initialAttachments = Array.isArray(parsed) ? parsed : []
    } catch {}

    const formDataRef = { current: initialForm }
    const attachmentsRef = { current: initialAttachments }

    const FormComponent = () => {
      const [form, setForm] = useState<FormData>(initialForm)
      const [localAttachments, setLocalAttachments] = useState<FileAttachment[]>(initialAttachments)
      const [uploading, setUploading] = useState(false)
      const [priorityOpen, setPriorityOpen] = useState(false)
      const [statusOpen, setStatusOpen] = useState(false)

      useEffect(() => { formDataRef.current = form }, [form])
      useEffect(() => { attachmentsRef.current = localAttachments }, [localAttachments])

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        setUploading(true)
        try {
          const { data } = await uploadService.uploadFiles(Array.from(files))
          setLocalAttachments((prev) => [...prev, ...data.data])
        } catch {
          console.error("Failed to upload files")
        } finally {
          setUploading(false)
          e.target.value = ""
        }
      }

      const removeAttachment = (index: number) => {
        setLocalAttachments((prev) => prev.filter((_, i) => i !== index))
      }

      return (
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
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
                    className={`w-2 h-2 rounded-full ${form.priority === "critical" ? "bg-red-500" :
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
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none flex items-center gap-2 ${form.priority === p ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${p === "critical" ? "bg-red-500" :
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
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${form.status === s ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
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

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className={labelClass}>Tệp đính kèm</label>
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1.5 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition cursor-pointer border border-blue-200 dark:border-blue-800">
                <Paperclip size={14} />
                {uploading ? "Đang tải..." : "Chọn tệp"}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <span className="text-xs text-zinc-400">Hình ảnh, PDF, DOC, XLS, ZIP... Tối đa 50MB/tệp</span>
            </div>
            {localAttachments.length > 0 && (
              <div className="space-y-1.5">
                {localAttachments.map((att, index) => {
                  const Icon = getFileIcon(att.mimetype)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2"
                    >
                      <Icon size={16} className="text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          {att.originalName}
                        </a>
                        <p className="text-xs text-zinc-400">{formatFileSize(att.size)}</p>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
                        title="Tải xuống"
                      >
                        <Download size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer border-none"
                        title="Xoá"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }

    MySwal.fire({
      title: editingId ? "Sửa project" : "Thêm project",
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: editingId ? "Cập nhật" : "Tạo mới",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: async () => {
        const form = formDataRef.current
        const attachments = attachmentsRef.current
        const payload: any = {
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          status: form.status,
          progress: form.progress,
          startDate: form.startDate || undefined,
          dueDate: form.dueDate || undefined,
          estimatedHours: form.estimatedHours || undefined,
          attachments: JSON.stringify(attachments),
        }
        try {
          if (editingId) {
            await projectService.update(editingId, payload)
          } else {
            payload.createdBy = user?.id || ""
            await projectService.create(payload)
          }
          fetchProjects()
        } catch {
          throw new Error("Lưu thất bại")
        }
      },
    })
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
            Quản lí Dự Án
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý công việc và dự án trong hệ thống
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const statusData = [
            { name: "Cần làm", value: projects.filter(p => p.status === "todo").length, color: "#71717a" },
            { name: "Đang làm", value: projects.filter(p => p.status === "in_progress").length, color: "#3b82f6" },
            { name: "Đánh giá", value: projects.filter(p => p.status === "review").length, color: "#f59e0b" },
            { name: "Hoàn thành", value: projects.filter(p => p.status === "completed").length, color: "#10b981" },
            { name: "Đã huỷ", value: projects.filter(p => p.status === "cancelled").length, color: "#ef4444" },
          ].filter(d => d.value > 0)
          const priorityData = [
            { name: "Thấp", value: projects.filter(p => p.priority === "low").length, color: "#71717a" },
            { name: "Trung bình", value: projects.filter(p => p.priority === "medium").length, color: "#3b82f6" },
            { name: "Cao", value: projects.filter(p => p.priority === "high").length, color: "#f97316" },
            { name: "Khẩn cấp", value: projects.filter(p => p.priority === "critical").length, color: "#ef4444" },
          ].filter(d => d.value > 0)
          const total = projects.length || 1
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
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Mức độ</p>
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {priorityData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col gap-2 pt-2">
                  {priorityData.map((entry) => (
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

      {/* Search */}
      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <button
              onClick={openCreate}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
              title="Thêm project"
            >
              <Plus size={18} />
            </button>
          )}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">UUID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tên dự án
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tệp
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Không tìm thấy project nào
                  </td>
                </tr>
              ) : (
                sorted.map((project) => {
                  let fileCount = 0
                  try {
                    const parsed = JSON.parse(project.attachments || "[]")
                    fileCount = Array.isArray(parsed) ? parsed.length : 0
                  } catch { }
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                          <Fingerprint size={12} className="shrink-0" />
                          {project.id.slice(0, 8)}...
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(project.id)
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
                        <div className="flex items-center gap-2">
                          <CheckSquare size={14} className="text-zinc-400 shrink-0" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                            {project.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[project.priority] || ""
                            }`}
                        >
                          {priorityLabels[project.priority] || project.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] || ""
                            }`}
                        >
                          {statusLabels[project.status] || project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${project.progress === 100
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
                      <td className="px-4 py-3">
                        {fileCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                            <Paperclip size={12} />
                            {fileCount}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-950 transition-colors cursor-pointer border-none"
                            title="Chi tiết"
                          >
                            <Eye size={15} />
                          </button>

                          {(user?.role === "admin") && (
                            <button
                              onClick={() => confirmDelete(project)}
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
    </div>
  )
}
