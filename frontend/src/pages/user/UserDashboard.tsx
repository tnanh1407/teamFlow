import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Users, CheckSquare, Activity, TrendingUp, Gauge, type LucideIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import userService, { type User } from "@/services/user.service"
import projectService, { type Project } from "@/services/project.service"

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    Promise.all([
      userService.getAll().then(({ data }) => setMembers(data.data)),
      projectService.getAll().then(({ data }) => setProjects(data.data)),
    ])
  }, [])

  const memberCount = members.filter((m) => m.position === "member").length
  const activeProjects = projects.filter((p) => p.status !== "completed").length
  const completedProjects = projects.filter((p) => p.status === "completed").length
  const inReviewCount = projects.filter((p) => p.status === "review").length

  const stats: { label: string; value: number; icon: LucideIcon; color: string; onClick?: () => void }[] = [
    {
      label: "Dự án đang thực hiện",
      value: activeProjects,
      icon: Activity,
      color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Đang đánh giá",
      value: inReviewCount,
      icon: Gauge,
      color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Dự án hoàn thành",
      value: completedProjects,
      icon: CheckSquare,
      color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Tổng dự án",
      value: projects.length,
      icon: TrendingUp,
      color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    },
  ]

  if (user?.position === "manager") {
    stats.unshift({
      label: "Thành viên",
      value: memberCount,
      icon: Users,
      color: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400",
      onClick: () => navigate("/members"),
    })
  }

  const recentProjects = projects.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Xin chào, {user?.username}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Bảng điều khiển
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm text-left hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dự án gần đây</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentProjects.length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có dự án nào</p>
            ) : (
              recentProjects.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{p.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.status === "todo" ? "Cần làm" : p.status === "in_progress" ? "Đang làm" : p.status === "review" ? "Đánh giá" : p.status === "completed" ? "Hoàn thành" : "Đã huỷ"}</p>
                  </div>
                  <div className="ml-4 w-20">
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 text-right mt-0.5">{p.progress}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thành viên</h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {members.filter((m) => m.position === "member").slice(0, 5).length === 0 ? (
              <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có thành viên nào</p>
            ) : (
              members.filter((m) => m.position === "member").slice(0, 5).map((m) => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{m.username}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{m.employeeId.slice(0, 8)}...</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${m.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                    {m.status ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}