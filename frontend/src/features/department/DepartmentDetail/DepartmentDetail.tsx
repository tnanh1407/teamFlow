import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Briefcase, Building2, Mail, Phone, Users } from "lucide-react"
import { motion } from "motion/react"
import LoadingState from "@/shared/ui/LoadingState"
import EmptyState from "@/shared/ui/EmptyState"
import departmentService, { type Department } from "@/services/department.service"
import userService, { type User } from "@/services/user.service"
import positionService, { type Position } from "@/services/position.service"

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [department, setDepartment] = useState<Department | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        const [deptRes, userRes, posRes] = await Promise.all([
          departmentService.getById(id),
          userService.getByDepartment(id),
          positionService.getAll(),
        ])
        setDepartment(deptRes.data.data)
        setMembers(userRes.data.data)
        setPositions(posRes.data.data)
      } catch {
        console.error("Failed to fetch department")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const getPosName = (posId: string | null) => (posId ? positions.find((p) => p.id === posId)?.name || posId : "—")
  const activeMembers = members.filter((m) => m.status).length

  if (loading) {
    return <LoadingState />
  }

  if (!department) {
    return (
      <EmptyState
        title="Không tìm thấy phòng ban"
        action={
          <button
            onClick={() => navigate("/departments")}
            className="cursor-pointer rounded-lg border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Quay lại
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/departments")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-none text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{department.name}</h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Chi tiết phòng ban</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900">
            <div className="h-20 bg-blue-600" />
            <div className="-mt-8 px-5 pb-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md dark:bg-zinc-900">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{department.name}</h2>
              <p className="mt-0.5 font-mono text-xs text-zinc-400">{department.code}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {department.description || "Chưa có mô tả"}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${department.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${department.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                  {department.isActive ? "Đang hoạt động" : "Vô hiệu"}
                </span>
              </div>
            </div>
            <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Thành viên</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{members.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Đang hoạt động</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{activeMembers}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thành viên</h2>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">{members.length} người</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.length === 0 ? (
                <EmptyState
                  title="Chưa có thành viên nào trong phòng ban này"
                  className="min-h-48 px-5 py-12"
                />
              ) : (
                members.map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-bold text-white">
                      {m.avatarURL ? (
                        <img src={m.avatarURL} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{m.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{m.name}</p>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${m.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                          {m.status ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Briefcase size={11} />{getPosName(m.positionId)}</span>
                        <span className="flex items-center gap-1"><Mail size={11} />{m.email}</span>
                        {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-zinc-300 dark:text-zinc-600">{m.employeeCode || "—"}</span>
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
