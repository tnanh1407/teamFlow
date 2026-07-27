import { useEffect, useState } from "react"
import { Briefcase, Building2, Medal, Users, CheckSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import employeeService from "@/services/employee.service"
import departmentService from "@/services/department.service"
import positionService from "@/services/position.service"
import projectService from "@/services/project.service"
import userService from "@/services/user.service"

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    activeEmployees: 0,
    departments: 0,
    positions: 0,
    users: 0,
    projects: 0,
    activeProjects: 0,
    completedProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [empRes, deptRes, posRes, projRes, userRes] = await Promise.all([
          employeeService.getAll(),
          departmentService.getAll(),
          positionService.getAll(),
          projectService.getAll(),
          userService.getAll(),
        ])
        const employees = empRes.data.data
        const projects = projRes.data.data
        setStats({
          employees: employees.length,
          activeEmployees: employees.filter((e) => e.status === "active").length,
          departments: deptRes.data.data.length,
          positions: posRes.data.data.length,
          users: userRes.data.data.length,
          projects: projects.length,
          activeProjects: projects.filter((p) => p.status === "in_progress" || p.status === "review").length,
          completedProjects: projects.filter((p) => p.status === "completed").length,
        })
      } catch {
        console.error("Failed to fetch dashboard stats")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const cards = [
    { label: "Nhân viên", value: stats.employees, sub: `${stats.activeEmployees} đang làm`, icon: Briefcase, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
    { label: "Phòng ban", value: stats.departments, icon: Building2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40" },
    { label: "Chức vụ", value: stats.positions, icon: Medal, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
    { label: "Tài khoản", value: stats.users, icon: Users, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/40" },
    { label: "Dự án", value: stats.projects, sub: `${stats.activeProjects} đang thực hiện`, icon: CheckSquare, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
    { label: "Hoàn thành", value: stats.completedProjects, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tổng quan</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Thống kê tổng quan hệ thống TeamFlow
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{card.value}</p>
                  {card.sub && (
                    <p className="text-xs text-zinc-400 mt-1">{card.sub}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
