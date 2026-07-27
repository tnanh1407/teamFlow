import { useEffect, useState } from "react"
import { CheckSquare, Clock, Gauge, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import projectService, { type Project } from "@/services/project.service"

export default function MemberDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    projectService.getAll().then(({ data }) => setProjects(data.data))
  }, [])

  const todoCount = projects.filter((p) => p.status === "todo" || p.status === "in_progress").length
  const completedCount = projects.filter((p) => p.status === "completed").length
  const inReviewCount = projects.filter((p) => p.status === "review").length

  const stats = [
    { label: "Việc cần làm", value: todoCount, icon: Clock, color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" },
    { label: "Đang đánh giá", value: inReviewCount, icon: Gauge, color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" },
    { label: "Hoàn thành", value: completedCount, icon: CheckSquare, color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" },
  ]

  const myProjects = projects.filter((p) => p.status !== "cancelled").slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Xin chào, {user?.username}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Bảng điều khiển cá nhân
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dự án của tôi</h2>
          <span className="text-xs text-zinc-400">{projects.length} dự án</span>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {myProjects.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có dự án nào được giao</p>
          ) : (
            myProjects.map((p) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.status === "todo" ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" :
                    p.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                    p.status === "review" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}>
                    {p.status === "todo" ? "Cần làm" : p.status === "in_progress" ? "Đang làm" : p.status === "review" ? "Đánh giá" : "Hoàn thành"}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{p.progress}% hoàn thành</span>
                  {p.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(p.dueDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
