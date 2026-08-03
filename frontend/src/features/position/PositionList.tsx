import { useEffect, useState, useRef } from "react"
import { Search, Plus, Pencil, Trash2, ArrowUpDown, Fingerprint, Copy } from "lucide-react"
import { Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"
import positionService, { type Position } from "@/services/position.service"
import { toast } from "sonner"
import { MySwal, showDeleteConfirm } from "@/lib/swal"


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
  Intern: "Thực tập sinh",
  Junior: "Mới đi làm",
  Middle: "Kinh nghiệm",
  Senior: "Cao cấp",
  Manager: "Quản lý",
}

const levelOrder = ["Intern", "Junior", "Middle", "Senior", "Manager"]

function FormContent({
  dataRef,
}: {
  dataRef: React.MutableRefObject<FormData>
}) {
  const [form, setForm] = useState<FormData>(dataRef.current)
  const [levelOpen, setLevelOpen] = useState(false)

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  useEffect(() => {
    dataRef.current = form
  }, [form, dataRef])

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Tên chức vụ</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="VD: Trưởng phòng"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Cấp bậc</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setLevelOpen(!levelOpen)}
            className={`${inputClass} flex items-center justify-between text-left`}
          >
            <span className={form.level ? "text-zinc-900" : "text-zinc-400"}>
              {form.level ? levelLabels[form.level] : "Chọn cấp bậc"}
            </span>
          </button>
          {levelOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
              {(["Intern", "Junior", "Middle", "Senior", "Manager"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, level: l })
                    setLevelOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer border-none ${
                    form.level === l ? "bg-blue-50 text-blue-700 font-medium" : "text-zinc-700"
                  }`}
                >
                  {levelLabels[l]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <label className={labelClass}>Mô tả</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Mô tả chức vụ (không bắt buộc)"
          rows={3}
          className={inputClass + " resize-none"}
        />
      </div>
    </div>
  )
}

export default function Positions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const formDataRef = useRef<FormData>(emptyForm)

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

  const openCreate = async () => {
    formDataRef.current = emptyForm
    await MySwal.fire({
      title: "Thêm chức vụ",
      width: 420,
      html: <FormContent dataRef={formDataRef} />,
      showCancelButton: true,
      confirmButtonText: "Tạo mới",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: async () => {
        const data = formDataRef.current
        if (!data.name.trim()) {
          MySwal.showValidationMessage("Vui lòng nhập tên chức vụ")
          return false
        }
        try {
          const payload: any = { name: data.name, description: data.description || undefined }
          if (data.level) payload.level = data.level
          await positionService.create(payload)
          await fetchPositions()
        } catch {
          MySwal.showValidationMessage("Không thể lưu chức vụ")
          return false
        }
      },
    })
  }

  const openEdit = async (e: React.MouseEvent, pos: Position) => {
    e.stopPropagation()
    formDataRef.current = { name: pos.name, description: pos.description, level: pos.level }
    await MySwal.fire({
      title: "Sửa chức vụ",
      width: 420,
      html: <FormContent dataRef={formDataRef} />,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: async () => {
        const data = formDataRef.current
        if (!data.name.trim()) {
          MySwal.showValidationMessage("Vui lòng nhập tên chức vụ")
          return false
        }
        try {
          const payload: any = { name: data.name, description: data.description || undefined }
          if (data.level) payload.level = data.level
          await positionService.update(pos.id, payload)
          await fetchPositions()
        } catch {
          MySwal.showValidationMessage("Không thể lưu chức vụ")
          return false
        }
      },
    })
  }

  const openDetail = async (pos: Position) => {
    await MySwal.fire({
      title: "Chi tiết chức vụ",
      width: 420,
      html: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
              {pos.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{pos.name}</h3>
              {pos.level && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mt-0.5">
                  {levelLabels[pos.level] || pos.level}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">UUID</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm text-zinc-700 dark:text-zinc-300 font-mono break-all">{pos.id}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pos.id)
                    toast.success("Đã sao chép UUID")
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent shrink-0"
                  title="Copy UUID"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mô tả</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{pos.description || "Chưa có mô tả"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ngày tạo</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{new Date(pos.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cập nhật</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{new Date(pos.updatedAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </div>
        </div>
      ),
      showConfirmButton: true,
      confirmButtonText: "Đóng",
    })
  }

  const confirmDelete = async (e: React.MouseEvent, pos: Position) => {
    e.stopPropagation()
    const confirmed = await showDeleteConfirm({
      name: pos.name,
    })
    if (!confirmed) return
    try {
      await positionService.delete(pos.id)
      await fetchPositions()
    } catch {
      console.error("Failed to delete position")
    }
  }


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

      <div className="">
        {(() => {
          const levelColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
          const levelData = levelOrder
            .map((l, i) => ({ name: levelLabels[l], value: positions.filter((p) => p.level === l).length, color: levelColors[i % levelColors.length] }))
            .filter((d) => d.value > 0)
          const total = positions.length || 1
          return (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Cấp bậc</p>
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={levelData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {levelData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col gap-2 pt-2">
                  {levelData.map((entry) => (
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
          )
        })()}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">UUID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tên chức vụ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cấp bậc</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mô tả</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Đang tải...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">Không tìm thấy chức vụ nào</td>
                </tr>
              ) : (
                sorted.map((pos) => (
                  <tr key={pos.id} onClick={() => openDetail(pos)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                        <Fingerprint size={12} className="shrink-0" />
                        {pos.id.slice(0, 8)}...
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(pos.id)
                            toast.success("Đã sao chép UUID")
                          }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy UUID"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
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
                        <button onClick={(e) => openEdit(e, pos)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none" title="Sửa">
                          <Pencil size={15} />
                        </button>
                        <button onClick={(e) => confirmDelete(e, pos)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none" title="Xoá">
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
