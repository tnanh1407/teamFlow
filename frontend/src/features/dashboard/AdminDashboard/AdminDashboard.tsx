import { useEffect, useState } from "react"
import { Briefcase, Building2, Medal, Users } from "lucide-react"
import userService from "@/services/user.service"
import departmentService from "@/services/department.service"
import positionService from "@/services/position.service"
import projectService from "@/services/project.service"
import StatsGrid from "./components/StatsGrid"
import GrowthChart from "./components/GrowthChart"
import DonutChartCard from "./components/DonutChartCard"

const colors = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  zinc: "#71717a",
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
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
        setEmployees(empRes.data.data)
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

  const deptColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"]
  const deptData = departments
    .map((d: any, i: number) => ({
      name: d.name,
      value: employees.filter((e: any) => e.departmentId === d.id).length,
      color: deptColors[i % deptColors.length],
    }))
    .filter((d) => d.value > 0)

  const projStatusData = [
    { name: "Cần làm", value: projects.filter((p: any) => p.status === "todo").length, color: colors.zinc },
    { name: "Đang làm", value: projects.filter((p: any) => p.status === "in_progress").length, color: colors.blue },
    { name: "Đánh giá", value: projects.filter((p: any) => p.status === "review").length, color: colors.amber },
    { name: "Hoàn thành", value: projects.filter((p: any) => p.status === "completed").length, color: colors.emerald },
    { name: "Đã huỷ", value: projects.filter((p: any) => p.status === "cancelled").length, color: colors.red },
  ].filter((d) => d.value > 0)

  const growthData = (() => {
    const months: Record<string, number> = {}
    employees.forEach((e: any) => {
      if (!e.hireDate) return
      const key = e.hireDate.slice(0, 7)
      months[key] = (months[key] || 0) + 1
    })
    const sorted = Object.keys(months).sort()
    let cum = 0
    return sorted.map((m) => {
      cum += months[m]
      const [y, mo] = m.split("-")
      return { month: `Th${parseInt(mo)}/${y}`, value: cum }
    })
  })()

  const stats = [
    { label: "Nhân viên", value: employees.length, icon: Briefcase, color: colors.blue },
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
      <GrowthChart data={growthData} currentTotal={employees.length} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChartCard title="Phân bố phòng ban" data={deptData} total={employees.length || 1} index={0} />
        <DonutChartCard title="Trạng thái dự án" data={projStatusData} total={projects.length || 1} index={1} />
      </div>
    </div>
  )
}
