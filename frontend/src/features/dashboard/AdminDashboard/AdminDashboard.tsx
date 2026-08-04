import { useEffect, useState } from "react"
import { Briefcase, Building2, Medal, UserCheck, UserX, Users } from "lucide-react"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService from "@/services/position.service"
import projectService, { type Project } from "@/services/project.service"
import StatsGrid from "./components/StatsGrid"
import GrowthChart from "./components/GrowthChart"
import DonutChartCard from "./components/DonutChartCard"
import { deptColors } from "./components/chartColors"

const colors = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  zinc: "#71717a",
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [deptCount, setDeptCount] = useState(0)
  const [posCount, setPosCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [empRes, deptRes, posRes, projRes, userRes] = await Promise.all([
          userService.getAll(),
          departmentService.getAll(),
          positionService.getAll(),
          projectService.getAll(),
          userService.getAll(),
        ])
        const depts = deptRes.data.data
        setUsers(empRes.data.data)
        setProjects(projRes.data.data)
        setDepartments(depts)
        setDeptCount(depts.length)
        setPosCount(posRes.data.data.length)
        setUserCount(userRes.data.data.length)
      } catch {
        console.error("Failed to fetch dashboard stats")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const deptData = departments
    .map((d) => ({
      name: d.name,
      value: users.filter((u) => u.departmentId === d.id).length,
    }))
    .filter((d) => d.value > 0)

  const projStatusData = [
    { name: "Cần làm", value: projects.filter((p) => p.status === "todo").length, color: colors.zinc },
    { name: "Đang làm", value: projects.filter((p) => p.status === "in_progress").length, color: colors.blue },
    { name: "Đánh giá", value: projects.filter((p) => p.status === "review").length, color: colors.amber },
    { name: "Hoàn thành", value: projects.filter((p) => p.status === "completed").length, color: colors.emerald },
    { name: "Đã huỷ", value: projects.filter((p) => p.status === "cancelled").length, color: colors.red },
  ].filter((d) => d.value > 0)

  const growthData = (() => {
    const events: Record<string, { hires: number; leaves: number }> = {}
    const monthKeys = new Set<string>()

    users.forEach((e) => {
      if (e.hireDate) {
        const hireKey = e.hireDate.slice(0, 7)
        events[hireKey] = events[hireKey] || { hires: 0, leaves: 0 }
        events[hireKey].hires += 1
        monthKeys.add(hireKey)
      }

      if (e.leaveDate) {
        const leaveKey = e.leaveDate.slice(0, 7)
        events[leaveKey] = events[leaveKey] || { hires: 0, leaves: 0 }
        events[leaveKey].leaves += 1
        monthKeys.add(leaveKey)
      }
    })

    const sorted = Array.from(monthKeys).sort()
    if (sorted.length === 0) return []

    const start = new Date(`${sorted[0]}-01T00:00:00Z`)
    const end = new Date(`${sorted[sorted.length - 1]}-01T00:00:00Z`)
    let cumActive = 0
    let cumDeparted = 0
    const data: { month: string; active: number; departed: number; hires: number; leaves: number }[] = []

    for (let cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
      const key = cursor.toISOString().slice(0, 7)
      const monthEvent = events[key] || { hires: 0, leaves: 0 }
      cumActive += monthEvent.hires - monthEvent.leaves
      cumDeparted += monthEvent.leaves
      const [y, mo] = key.split("-")
      data.push({
        month: `Th${Number.parseInt(mo, 10)}/${y}`,
        active: cumActive,
        departed: cumDeparted,
        hires: monthEvent.hires,
        leaves: monthEvent.leaves,
      })
    }

    return data
  })()

  const todayKey = new Date().toISOString().slice(0, 10)
  const activeUsersCount = users.filter((u) => !u.leaveDate || u.leaveDate > todayKey).length
  const departedUsersCount = users.filter((u) => !!u.leaveDate && u.leaveDate <= todayKey).length

  const stats = [
    { label: "Người dùng", value: users.length, icon: Briefcase, color: colors.blue },
    { label: "Đang làm", value: activeUsersCount, icon: UserCheck, color: colors.emerald },
    { label: "Đã nghỉ", value: departedUsersCount, icon: UserX, color: colors.red },
    { label: "Phòng ban", value: deptCount, icon: Building2, color: colors.emerald },
    { label: "Chức vụ", value: posCount, icon: Medal, color: colors.purple },
    { label: "Tài khoản", value: userCount, icon: Users, color: colors.amber },
  ]

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
          palette={deptColors}
        />
        <DonutChartCard title="Trạng thái dự án" data={projStatusData} total={projects.length || 1} index={1} />
      </div>
    </div>
  )
}
