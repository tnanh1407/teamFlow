import { useEffect, useState } from "react"
import { Briefcase, Building2, Medal, UserCheck, UserX, Users } from "lucide-react"
import StatsGrid from "./components/StatsGrid"
import GrowthChart from "./components/GrowthChart"
import DonutChartCard from "./components/DonutChartCard"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService from "@/services/position.service"
import projectService, { type Project } from "@/services/project.service"

interface DashboardGrowthPoint {
  month: string
  active: number
  departed: number
  totalHires: number
  hires: number
  leaves: number
}

interface DashboardChartPoint {
  name: string
  value: number
  color?: string
}

interface DashboardStat {
  label: string
  value: number
  icon: React.ElementType
  color: string
}

const departmentPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

const projectPalette = {
  todo: "var(--chart-8)",
  in_progress: "var(--chart-1)",
  review: "var(--chart-3)",
  completed: "var(--chart-2)",
  cancelled: "var(--chart-5)",
}

const colors = {
  blue: "var(--chart-1)",
  emerald: "var(--chart-2)",
  amber: "var(--chart-3)",
  purple: "var(--chart-4)",
  red: "var(--chart-5)",
}

function buildDepartmentData(users: User[], departments: Department[]): DashboardChartPoint[] {
  return departments
    .map((department) => ({
      name: department.name,
      value: users.filter((user) => user.departmentId === department.id).length,
    }))
    .filter((department) => department.value > 0)
}

function buildProjectStatusData(projects: Project[]): DashboardChartPoint[] {
  return [
    { name: "Cần làm", value: projects.filter((project) => project.status === "todo").length, color: projectPalette.todo },
    { name: "Đang làm", value: projects.filter((project) => project.status === "in_progress").length, color: projectPalette.in_progress },
    { name: "Đánh giá", value: projects.filter((project) => project.status === "review").length, color: projectPalette.review },
    { name: "Hoàn thành", value: projects.filter((project) => project.status === "completed").length, color: projectPalette.completed },
    { name: "Đã huỷ", value: projects.filter((project) => project.status === "cancelled").length, color: projectPalette.cancelled },
  ].filter((project) => project.value > 0)
}

function buildGrowthData(users: User[]): DashboardGrowthPoint[] {
  const events: Record<string, { hires: number; leaves: number }> = {}
  const monthKeys = new Set<string>()

  users.forEach((user) => {
    if (user.hireDate) {
      const hireKey = user.hireDate.slice(0, 7)
      events[hireKey] = events[hireKey] || { hires: 0, leaves: 0 }
      events[hireKey].hires += 1
      monthKeys.add(hireKey)
    }

    if (user.leaveDate) {
      const leaveKey = user.leaveDate.slice(0, 7)
      events[leaveKey] = events[leaveKey] || { hires: 0, leaves: 0 }
      events[leaveKey].leaves += 1
      monthKeys.add(leaveKey)
    }
  })

  const sortedMonths = Array.from(monthKeys).sort()
  if (sortedMonths.length === 0) return []

  const start = new Date(`${sortedMonths[0]}-01T00:00:00Z`)
  const end = new Date(`${sortedMonths[sortedMonths.length - 1]}-01T00:00:00Z`)
  const result: DashboardGrowthPoint[] = []
  let active = 0
  let departed = 0
  let totalHires = 0

  for (const cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
    const key = cursor.toISOString().slice(0, 7)
    const monthEvent = events[key] || { hires: 0, leaves: 0 }
    active += monthEvent.hires - monthEvent.leaves
    departed += monthEvent.leaves
    totalHires += monthEvent.hires

    const [year, month] = key.split("-")
    result.push({
      month: `Th${Number.parseInt(month, 10)}/${year}`,
      active,
      departed,
      totalHires,
      hires: monthEvent.hires,
      leaves: monthEvent.leaves,
    })
  }

  return result
}

function countActiveUsers(users: User[], todayKey: string) {
  return users.filter((user) => !user.leaveDate || user.leaveDate > todayKey).length
}

function countDepartedUsers(users: User[], todayKey: string) {
  return users.filter((user) => !!user.leaveDate && user.leaveDate <= todayKey).length
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positionsCount, setPositionsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    const fetchDashboard = async () => {
      try {
        const [usersRes, deptRes, posRes, projRes] = await Promise.all([
          userService.getAll(),
          departmentService.getAll(),
          positionService.getAll(),
          projectService.getAll(),
        ])

        if (!alive) return

        setUsers(usersRes.data.data)
        setProjects(projRes.data.data)
        setDepartments(deptRes.data.data)
        setPositionsCount(posRes.data.data.length)
      } catch {
        if (!alive) return
        console.error("Failed to fetch dashboard stats")
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchDashboard()

    return () => {
      alive = false
    }
  }, [])

  const todayKey = new Date().toISOString().slice(0, 10)
  const activeUsersCount = countActiveUsers(users, todayKey)
  const departedUsersCount = countDepartedUsers(users, todayKey)

  const stats: DashboardStat[] = [
    { label: "Người dùng", value: users.length, icon: Briefcase, color: colors.blue },
    { label: "Đang làm", value: activeUsersCount, icon: UserCheck, color: colors.emerald },
    { label: "Đã nghỉ", value: departedUsersCount, icon: UserX, color: colors.red },
    { label: "Phòng ban", value: departments.length, icon: Building2, color: colors.emerald },
    { label: "Chức vụ", value: positionsCount, icon: Medal, color: colors.purple },
    { label: "Tài khoản", value: users.length, icon: Users, color: colors.amber },
  ]

  const growthData = buildGrowthData(users)
  const deptData = buildDepartmentData(users, departments)
  const projStatusData = buildProjectStatusData(projects)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-zinc-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} />
      <GrowthChart data={growthData} currentTotal={activeUsersCount} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChartCard
          title="Phân bố phòng ban"
          data={deptData}
          total={users.length || 1}
          index={0}
          palette={departmentPalette}
        />
        <DonutChartCard title="Trạng thái dự án" data={projStatusData} total={projects.length || 1} index={1} />
      </div>
    </div>
  )
}
