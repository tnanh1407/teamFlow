import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2, Pencil, X, Paperclip, File, FileImage, Download, Check, UserPlus } from "lucide-react"
import projectService, { type Project, type FileAttachment } from "@/services/project.service"
import projectLogService, { type ProjectLog } from "@/services/project-log.service"
import projectDepartmentService, { type ProjectDepartment } from "@/services/project-department.service"
import projectMemberService, { type ProjectMember } from "@/services/project-employee.service"
import projectCommentService, { type ProjectComment } from "@/services/project-comment.service"
import departmentService, { type Department } from "@/services/department.service"
import userService, { type User } from "@/services/user.service"
import uploadService from "@/services/upload.service"
import { useAuth } from "@/contexts/AuthContext"
import ProjectLogsSection from "./components/ProjectLogsSection"
import ProjectCommentsSection from "./components/ProjectCommentsSection"
import ProjectDepartmentsSection from "./components/ProjectDepartmentsSection"
import ProjectMembersSection from "./components/ProjectMembersSection"
import { MySwal, showDeleteConfirm } from "@/lib/swal"

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

const actionLabels: Record<string, string> = {
  created: "Tạo mới",
  updated: "Cập nhật",
  assigned: "Phân công",
  completed: "Hoàn thành",
  commented: "Bình luận",
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

async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(url, "_blank")
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [deptUserCount, setDeptUserCount] = useState<Record<string, number>>({})
  const [, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [allDepartments, setAllDepartments] = useState<Department[]>([])
  const [projectDeptIds, setProjectDeptIds] = useState<string[]>([])
  const [projectMembers, setProjectMembers] = useState<(ProjectMember & { user?: User })[]>([])
  const [logUserMap, setLogUserMap] = useState<Record<string, User>>({})
  const [comments, setComments] = useState<(ProjectComment & { user?: User })[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState<FileAttachment[]>([])
  const [commentUploading, setCommentUploading] = useState(false)
  const [userDeptId, setUserDeptId] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"
  const isManager = user?.position === "manager"
  const canEdit = isAdmin || isManager
  const canDelete = isAdmin
  const canManageMembers = canEdit || (isManager && !!userDeptId)

  const inputClass = "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const fetchProject = () => {
    if (!id) return
    setLoading(true)
    Promise.all([
      projectService.getById(id),
      projectLogService.getByProject(id),
      projectDepartmentService.getByProject(id),
      projectMemberService.getByProject(id),
      projectCommentService.getByProject(id),
    ])
      .then(([projRes, logsRes, deptRes, memberRes, commentRes]) => {
        const proj = projRes.data.data
        setProject(proj)
        const rawLogs = logsRes.data.data as ProjectLog[]
        setLogs(rawLogs)

        const uniqueUserIds = [...new Set(rawLogs.map((l) => l.userId).filter(Boolean))]
        if (uniqueUserIds.length > 0) {
          Promise.all(uniqueUserIds.map((uid) => userService.getById(uid)))
            .then((results) => {
              const map: Record<string, User> = {}
              results.forEach((r: any) => {
                const user = r.data.data
                if (user) map[user.id] = user
              })
              setLogUserMap(map)
            })
        }

        const pdeps = deptRes.data.data
        setProjectDeptIds(pdeps.map((pd: ProjectDepartment) => pd.departmentId))

        const pdepts = pdeps as ProjectDepartment[]
        if (pdepts.length > 0) {
          const deptIds = pdepts.map((pd: ProjectDepartment) => pd.departmentId)
          Promise.all([
            ...deptIds.map((did: string) => departmentService.getById(did)),
            ...deptIds.map((did: string) => userService.getByDepartment(did)),
          ]).then((results) => {
            const mid = deptIds.length
            const depts = results.slice(0, mid).map((r: any) => r.data.data)
            const empResults = results.slice(mid).map((r: any) => r.data.data as User[])

            const countMap: Record<string, number> = {}
            deptIds.forEach((did, i) => {
              countMap[did] = empResults[i]?.length || 0
            })
            setDeptUserCount(countMap)
            setDepartments(depts)
            setUsers(empResults.flat())
          })
        } else {
          setDepartments([])
          setUsers([])
          setDeptUserCount({})
        }

        const pemps = memberRes.data.data as ProjectMember[]
        if (pemps.length > 0) {
          Promise.all(
            pemps.map((pm: ProjectMember) =>
              userService.getById(pm.userId).then((r) => ({ ...pm, user: r.data.data }))
            )
          ).then((enriched) => setProjectMembers(enriched))
        } else {
          setProjectMembers([])
        }

        const rawComments = commentRes.data.data as ProjectComment[]
        if (rawComments.length > 0) {
          Promise.all(
            rawComments.map((c: ProjectComment) =>
              userService.getById(c.userId).then((r) => ({ ...c, user: r.data.data }))
            )
          ).then((enriched) => setComments(enriched))
        } else {
          setComments([])
        }
      })
      .catch(() => console.error("Failed to fetch project detail"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProject()
    departmentService.getAll().then((r) => setAllDepartments(r.data.data))
    if (user?.id) {
      userService.getById(user.id).then((r) => {
        const emp = r.data.data
        if (emp) {
          setLogUserMap((prev) => ({ ...prev, [emp.id]: emp }))
          if (emp.departmentId) setUserDeptId(emp.departmentId)
        }
      })
    }
  }, [id])

  const handleOpenAddMember = async () => {
    if (!project) return

    const initialDeptId = isManager && userDeptId ? userDeptId : ""
    let currentDeptId = initialDeptId
    let currentUserIds: string[] = []
    let currentDeptEmps: User[] = []

    const AddMemberContent = () => {
      const [selectedDeptId, setSelectedDeptId] = useState(initialDeptId)
      const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([])
      const [selectedDeptOpen, setSelectedDeptOpen] = useState(false)
      const [deptEmps, setDeptEmps] = useState<User[]>([])
      const selectDeptRef = useRef<HTMLDivElement>(null)

      useEffect(() => {
        currentDeptId = selectedDeptId
        currentUserIds = selectedEmpIds
        currentDeptEmps = deptEmps
      }, [selectedDeptId, selectedEmpIds, deptEmps])

      useEffect(() => {
        const handleClick = (e: MouseEvent) => {
          if (selectDeptRef.current && !selectDeptRef.current.contains(e.target as Node)) {
            setSelectedDeptOpen(false)
          }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
      }, [])

      useEffect(() => {
        if (selectedDeptId) {
          userService.getByDepartment(selectedDeptId).then((r) => {
            const emps = r.data.data
            setDeptEmps(emps)
            const existingUserIds = projectMembers.map((m) => m.userId)
            const preSelected = emps.filter((e) => existingUserIds.includes(e.id)).map((e) => e.id)
            setSelectedEmpIds(preSelected)
          })
        } else {
          setDeptEmps([])
          setSelectedEmpIds([])
        }
      }, [selectedDeptId, projectMembers])

      const availableDepts = isAdmin
        ? allDepartments.filter((d) => !projectDeptIds.includes(d.id))
        : isManager && userDeptId
        ? allDepartments.filter((d) => d.id === userDeptId)
        : []

      const toggleEmp = (empId: string) => {
        setSelectedEmpIds((prev) =>
          prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
        )
      }

      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Chọn phòng ban</label>
            <div className="relative" ref={selectDeptRef}>
              <button
                type="button"
                onClick={() => setSelectedDeptOpen(!selectedDeptOpen)}
                className={`${inputClass} flex items-center justify-between`}
              >
                <span className={selectedDeptId ? "text-zinc-900" : "text-zinc-400"}>
                  {selectedDeptId
                    ? allDepartments.find((d) => d.id === selectedDeptId)?.name
                    : "Chọn phòng ban..."}
                </span>
                <span className="text-zinc-400">▾</span>
              </button>
              {selectedDeptOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-10 max-h-48 overflow-y-auto">
                  {availableDepts.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-zinc-400">Không còn phòng ban nào</p>
                  ) : (
                    availableDepts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => { setSelectedDeptId(d.id); setSelectedDeptOpen(false) }}
                        className={`w-full text-left px-3 py-2 text-sm transition cursor-pointer border-none ${
                          selectedDeptId === d.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {d.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedDeptId && (() => {
            const existingUserIds = projectMembers.map((m) => m.userId)
            const availableEmps = deptEmps.filter((e) => !existingUserIds.includes(e.id))
            return (
              <div>
                <label className={labelClass}>Chọn thành viên ({availableEmps.length} người)</label>
                <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-zinc-200 dark:border-zinc-700 p-1">
                  {availableEmps.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-zinc-400 text-center">Tất cả nhân viên phòng ban này đã ở trong dự án</p>
                  ) : (
                    availableEmps.map((emp) => {
                      const checked = selectedEmpIds.includes(emp.id)
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleEmp(emp.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition cursor-pointer border-none ${
                            checked
                              ? "bg-blue-50 dark:bg-blue-950"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                            checked
                              ? "bg-blue-600 border-blue-600"
                              : "border-zinc-300 dark:border-zinc-600"
                          }`}>
                            {checked && <Check size={12} className="text-white" />}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {emp.avatarURL ? (
                              <img src={emp.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{emp.name?.slice(0, 2).toUpperCase() || "??"}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{emp.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{emp.email}</p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )
    }

    const result = await MySwal.fire({
      title: "Thêm phòng ban và thành viên",
      html: <AddMemberContent />,
      showCancelButton: true,
      confirmButtonText: "Thêm",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: () => {
        if (!currentDeptId) {
          MySwal.showValidationMessage("Vui lòng chọn phòng ban")
          return false
        }
        if (currentUserIds.length === 0) {
          MySwal.showValidationMessage("Vui lòng chọn thành viên")
          return false
        }
        return { departmentId: currentDeptId, userIds: currentUserIds }
      },
    })

    if (!result.isConfirmed) return

    const { departmentId, userIds } = result.value
    try {
      if (!projectDeptIds.includes(departmentId)) {
        await projectDepartmentService.create({ projectId: project.id, departmentId })
      }

      const existingUserIds = projectMembers.map((m) => m.userId)
      const userIdsToAdd = userIds.filter((id: string) => !existingUserIds.includes(id))
      const newMembers = currentDeptEmps.filter((e) => userIdsToAdd.includes(e.id))

      if (userIdsToAdd.length > 0) {
        await Promise.all(
          userIdsToAdd.map((userId: string) =>
            projectMemberService.create({ projectId: project.id, userId })
          )
        )
        if (user?.id) {
          const deptName = allDepartments.find((d) => d.id === departmentId)?.name || ""
          await Promise.all(
            newMembers.map((m) =>
              projectLogService.create({
                projectId: project.id,
                userId: user.id,
                action: "assigned",
                description: `${m.name} - ${deptName}`,
              })
            )
          )
        }
      }
      fetchProject()
    } catch (err) {
      console.error("Failed to add member", err)
    }
  }

  const handleOpenEdit = async () => {
    if (!project) return

    const snap: FormData = {
      title: project.title,
      description: project.description,
      priority: project.priority,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : "",
      estimatedHours: project.estimatedHours || 0,
    }

    let initialAttachments: FileAttachment[] = []
    try {
      initialAttachments = JSON.parse(project.attachments || "[]")
    } catch {}

    let currentForm = { ...snap }
    let currentAttachments = [...initialAttachments]

    const EditFormContent = () => {
      const [form, setForm] = useState<FormData>(snap)
      const [attachments, setAttachments] = useState<FileAttachment[]>(initialAttachments)
      const [uploading, setUploading] = useState(false)
      const [priorityOpen, setPriorityOpen] = useState(false)
      const [statusOpen, setStatusOpen] = useState(false)

      useEffect(() => { currentForm = form }, [form])
      useEffect(() => { currentAttachments = attachments }, [attachments])

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        setUploading(true)
        try {
          const { data } = await uploadService.uploadFiles(Array.from(files))
          setAttachments((prev) => [...prev, ...data.data])
        } catch {
          console.error("Failed to upload files")
        } finally {
          setUploading(false)
          e.target.value = ""
        }
      }

      const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index))
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
                  <span className={`w-2 h-2 rounded-full ${
                    form.priority === "critical" ? "bg-red-500" :
                    form.priority === "high" ? "bg-orange-500" :
                    form.priority === "medium" ? "bg-blue-500" :
                    "bg-slate-400"
                  }`} />
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
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att, index) => {
                  const Icon = getFileIcon(att.mimetype)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2"
                    >
                      <Icon size={16} className="text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => downloadFile(att.url, att.originalName)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block text-left cursor-pointer border-none bg-transparent p-0"
                        >
                          {att.originalName}
                        </button>
                        <p className="text-xs text-zinc-400">{formatFileSize(att.size)}</p>
                      </div>
                      <button
                        onClick={() => downloadFile(att.url, att.originalName)}
                        className="p-1 rounded text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer border-none"
                        title="Tải xuống"
                      >
                        <Download size={14} />
                      </button>
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

    const result = await MySwal.fire({
      title: "Sửa project",
      html: <EditFormContent />,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: () => {
        if (!currentForm.title.trim()) {
          MySwal.showValidationMessage("Vui lòng nhập tiêu đề")
          return false
        }
        return { form: currentForm, attachments: currentAttachments }
      },
    })

    if (!result.isConfirmed) return

    const { form, attachments } = result.value

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
        attachments: JSON.stringify(attachments),
      }
      await projectService.update(project.id, payload)

      const fieldLabels: Record<string, string> = {
        title: "tiêu đề",
        description: "mô tả",
        priority: "mức độ",
        status: "trạng thái",
        progress: "tiến độ",
        startDate: "ngày bắt đầu",
        dueDate: "hạn chót",
        estimatedHours: "giờ dự kiến",
      }

      const formatVal = (key: string, val: string): string => {
        if (!val) return "trống"
        if (key === "priority") return priorityLabels[val] || val
        if (key === "status") return statusLabels[val] || val
        if (key === "startDate" || key === "dueDate") return new Date(val).toLocaleDateString("vi-VN")
        return val
      }

      const roleLabel: Record<string, string> = {
        admin: "Admin",
        manager: "Manager",
        member: "Member",
      }

      const changed: string[] = []
      for (const [key, label] of Object.entries(fieldLabels)) {
        const oldVal = String((snap as any)[key] ?? "")
        const newVal = String((form as any)[key] ?? "")
        if (oldVal !== newVal) {
          changed.push(`${label}: ${formatVal(key, oldVal)} → ${formatVal(key, newVal)}`)
        }
      }

      if (user?.id) {
        const roleStr = roleLabel[user.position] || user.position
        await projectLogService.create({
          projectId: project.id,
          userId: user.id,
          action: "updated",
          description: changed.length > 0
            ? `[${roleStr}] ${changed.join("; ")}`
            : `[${roleStr}] thông tin project`,
        })
      }

      fetchProject()
    } catch {
      console.error("Failed to save project")
    }
  }

  const handleLogDetail = (log: ProjectLog) => {
    const emp = logUserMap[log.userId]
    const initials = emp?.name?.slice(0, 2).toUpperCase() || "??"

    MySwal.fire({
      title: "Chi tiết hoạt động",
      html: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {emp?.avatarURL ? (
                <img src={emp.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{emp?.name || "—"}</p>
              <p className="text-xs text-zinc-400">{emp?.employeeCode ? `Mã NV: ${emp.employeeCode}` : ""}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hành động</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  log.action === "assigned" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                  log.action === "updated" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                  log.action === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {actionLabels[log.action] || log.action}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Thời gian</label>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(log.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chi tiết</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
              {log.description || "—"}
            </p>
          </div>
        </div>
      ),
      confirmButtonText: "Đóng",
    })
  }

  const handleDelete = async () => {
    if (!project) return
    const confirmed = await showDeleteConfirm({
      name: project.title,
    })
    if (!confirmed) return
    try {
      await projectService.delete(project.id)
      navigate("/projects")
    } catch {
      console.error("Failed to delete project")
    }
  }

  const removeDepartment = async (departmentId: string) => {
    if (!project) return
    try {
      await projectDepartmentService.delete(project.id, departmentId)
      if (user?.id) {
        const dept = departments.find((d) => d.id === departmentId)
        await projectLogService.create({
          projectId: project.id,
          userId: user.id,
          action: "updated",
          description: `Phòng ban ${dept?.name || ""}`,
        })
      }
      fetchProject()
    } catch {
      console.error("Failed to remove department")
    }
  }

  const removeMember = async (id: string) => {
    if (!project) return
    try {
      const pm = projectMembers.find((m) => m.id === id)
      await projectMemberService.delete(id)
      if (user?.id && pm?.user?.name) {
        await projectLogService.create({
          projectId: project.id,
          userId: user.id,
          action: "updated",
          description: pm.user.name,
        })
      }
      fetchProject()
    } catch {
      console.error("Failed to remove member")
    }
  }

  const handleCommentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setCommentUploading(true)
    try {
      const { data } = await uploadService.uploadFiles(Array.from(files))
      setCommentFiles((prev) => [...prev, ...data.data])
    } catch {
      console.error("Failed to upload comment files")
    } finally {
      setCommentUploading(false)
      e.target.value = ""
    }
  }

  const removeCommentFile = (index: number) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddComment = async () => {
    if (!project || !user?.id || (!commentText.trim() && commentFiles.length === 0)) return
    try {
      const { data } = await projectCommentService.create({
        projectId: project.id,
        userId: user.id,
        content: commentText.trim() || undefined,
        attachments: commentFiles.length > 0 ? JSON.stringify(commentFiles) : undefined,
      })
      const emp = await userService.getById(user.id)
      setComments((prev) => [{ ...data.data, user: emp.data.data }, ...prev])
      if (user.id) {
        await projectLogService.create({
          projectId: project.id,
          userId: user.id,
          action: "commented",
          description: commentText.trim() || "đã bình luận",
        })
      }
      setCommentText("")
      setCommentFiles([])
      fetchProject()
    } catch {
      console.error("Failed to add comment")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await projectCommentService.delete(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      if (project && user?.id) {
        await projectLogService.create({
          projectId: project.id,
          userId: user.id,
          action: "updated",
          description: "đã xoá một bình luận",
        })
      }
      fetchProject()
    } catch {
      console.error("Failed to delete comment")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-zinc-500">Không tìm thấy project</p>
        <button onClick={() => navigate("/projects")} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none">Quay lại</button>
      </div>
    )
  }

  let fileCount = 0
  try {
    const parsed = JSON.parse(project.attachments || "[]")
    fileCount = Array.isArray(parsed) ? parsed.length : 0
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/projects")} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{project.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Chi tiết project</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageMembers && (
            <button
              onClick={handleOpenAddMember}
              className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition cursor-pointer border-none shadow-sm"
            >
              <UserPlus size={15} />
              <span>Thêm thành viên</span>
            </button>
          )}
          {canEdit && (
            <button onClick={handleOpenEdit} className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer bg-transparent">
              <Pencil size={15} />
              <span>Sửa</span>
            </button>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer bg-transparent">
              <Trash2 size={15} />
              <span>Xoá</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thông tin project</h2>
            </div>
            <div className="p-5 space-y-4">
              {project.description && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mô tả</label>
                  <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{project.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mức độ</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[project.priority] || ""}`}>
                      {priorityLabels[project.priority] || project.priority}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trạng thái</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] || ""}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tiến độ</label>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.progress}%</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tệp đính kèm</label>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{fileCount} tệp</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.startDate && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ngày bắt đầu</label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(project.startDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                )}
                {project.dueDate && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hạn chót</label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(project.dueDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                )}
                {project.estimatedHours && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Giờ dự kiến</label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.estimatedHours}h</p>
                  </div>
                )}
                {project.actualHours && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Giờ thực tế</label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.actualHours}h</p>
                  </div>
                )}
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${project.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <ProjectLogsSection
              logs={logs}
              logUserMap={logUserMap}
              onSelectLog={handleLogDetail}
            />
          )}

          <ProjectCommentsSection
            comments={comments}
            user={user}
            commentText={commentText}
            setCommentText={setCommentText}
            commentFiles={commentFiles}
            commentUploading={commentUploading}
            handleCommentFileUpload={handleCommentFileUpload}
            removeCommentFile={removeCommentFile}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
          />
        </div>

        <div className="space-y-6">
          <ProjectDepartmentsSection
            departments={departments}
            deptUserCount={deptUserCount}
            canEdit={canEdit}
            onOpenAddModal={handleOpenAddMember}
            onRemoveDepartment={removeDepartment}
          />

          <ProjectMembersSection
            projectMembers={projectMembers}
            departments={departments}
            canManageMembers={canManageMembers}
            isManager={isManager}
            canEdit={canEdit}
            userDeptId={userDeptId}
            onOpenAddModal={handleOpenAddMember}
            onRemoveMember={removeMember}
          />

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thông tin khác</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-zinc-400">Ngày tạo</label>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(project.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              {project.updatedAt && (
                <div>
                  <label className="text-xs text-zinc-400">Cập nhật lần cuối</label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(project.updatedAt).toLocaleString("vi-VN")}</p>
                </div>
              )}
              {project.completedAt && (
                <div>
                  <label className="text-xs text-zinc-400">Hoàn thành lúc</label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(project.completedAt).toLocaleString("vi-VN")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
