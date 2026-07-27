import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, Users, Mail, Phone, Briefcase } from "lucide-react"
import { motion } from "motion/react"
import departmentService, { type Department } from "@/services/department.service"
import employeeService, { type Employee } from "@/services/employee.service"
import positionService, { type Position } from "@/services/position.service"
const statusLabels: Record<string, string> = {
  active: "Đang làm",
  probation: "Thử việc",
  inactive: "Đã nghỉ",
}

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [department, setDepartment] = useState<Department | null>(null)
  const [members, setMembers] = useState<Employee[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const [deptRes, empRes, posRes] = await Promise.all([
          departmentService.getById(id),
          employeeService.getByDepartment(id),
          positionService.getAll(),
        ])
        setDepartment(deptRes.data.data)
        setMembers(empRes.data.data)
        setPositions(posRes.data.data)
      } catch {
        console.error("Failed to fetch department")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const getPosName = (posId: string) => positions.find((p) => p.id === posId)?.name || posId

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-zinc-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-zinc-500">Không tìm thấy phòng ban</p>
        <button onClick={() => navigate("/departments")} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none">
          Quay lại
        </button>
      </div>
    )
  }

  const activeMembers = members.filter((m) => m.status === "active").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/departments")} className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{department.name}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Chi tiết phòng ban</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="h-20 bg-blue-600" />
            <div className="px-5 pb-5 -mt-8">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center mb-4">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{department.name}</h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">{department.code}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">{department.description || "Chưa có mô tả"}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${department.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${department.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                  {department.isActive ? "Đang hoạt động" : "Vô hiệu"}
                </span>
              </div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Thành viên</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{members.length}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-400">Đang hoạt động</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{activeMembers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thành viên</h2>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">{members.length} người</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.length === 0 ? (
                <p className="px-5 py-12 text-sm text-zinc-400 text-center">Chưa có thành viên nào trong phòng ban này</p>
              ) : (
                members.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {m.avatarURL ? (
                        <img src={m.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{m.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{m.name}</p>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          m.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          m.status === "probation" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}>
                          {statusLabels[m.status] || m.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Briefcase size={11} />{getPosName(m.positionId)}</span>
                        <span className="flex items-center gap-1"><Mail size={11} />{m.email}</span>
                        {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-300 dark:text-zinc-600 shrink-0">{m.employeeCode}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}