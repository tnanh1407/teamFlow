import { useEffect, useState } from "react"
import { Briefcase, Building2, Medal, Users, TrendingUp, ArrowUpRight, Circle } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { motion } from "motion/react"
import employeeService from "@/services/employee.service"
import departmentService from "@/services/department.service"
import positionService from "@/services/position.service"
import projectService from "@/services/project.service"
import userService from "@/services/user.service"
import { useAuth } from "@/contexts/AuthContext"

const colors  = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  zinc: "#71717a",
}

export default function AdminDashboard() {
  const { user } = useAuth()
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
          employeeService.getAll(),
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
  const deptData = departments.map((d: any, i: number) => ({
    name: d.name,
    value: employees.filter((e: any) => e.departmentId === d.id).length,
    color: deptColors[i % deptColors.length],
  })).filter(d => d.value > 0)

  const projStatusData = [
    { name: "Cần làm", value: projects.filter((p: any) => p.status === "todo").length, color: colors.zinc },
    { name: "Đang làm", value: projects.filter((p: any) => p.status === "in_progress").length, color: colors.blue },
    { name: "Đánh giá", value: projects.filter((p: any) => p.status === "review").length, color: colors.amber },
    { name: "Hoàn thành", value: projects.filter((p: any) => p.status === "completed").length, color: colors.emerald },
    { name: "Đã huỷ", value: projects.filter((p: any) => p.status === "cancelled").length, color: colors.red },
  ].filter(d => d.value > 0)

  const empTotal = employees.length || 1
  const projTotal = projects.length || 1

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
      const label = `Th${parseInt(mo)}/${y}`
      return { month: label, value: cum }
    })
  })()

  const stats = [
    { label: "Nhân viên", value: employees.length, icon: Briefcase, color: colors.blue, bg: "from-blue-500/10 to-blue-600/5" },
    { label: "Phòng ban", value: deptCount, icon: Building2, color: colors.emerald, bg: "from-emerald-500/10 to-emerald-600/5" },
    { label: "Chức vụ", value: posCount, icon: Medal, color: colors.purple, bg: "from-purple-500/10 to-purple-600/5" },
    { label: "Tài khoản", value: userCount, icon: Users, color: colors.amber, bg: "from-amber-500/10 to-amber-600/5" },
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
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-700 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-16 -translate-y-16 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              Dashboard
            </div>
            <div className="flex items-center gap-1 text-white/50 text-xs">
              <Circle size={4} fill="currentColor" />
              <span>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.avatarURL ? (
                  <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.username.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Xin chào, {user?.username || "Admin"}
            </h1>
          </div>
          <p className="mt-1 text-sm text-blue-100/80 max-w-xl">
            Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống TeamFlow của bạn.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group relative overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200"
            >
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={22} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Growth Chart */}
      {growthData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tăng trưởng nhân viên</h2>
            </div>
            <span className="text-[11px] font-medium text-zinc-400">{employees.length} hiện tại</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={growthData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {([
          { title: "Phân bố phòng ban", data: deptData, total: empTotal },
          { title: "Trạng thái dự án", data: projStatusData, total: projTotal },
        ] as const).map((chart, i) => (
          <motion.div
            key={chart.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{chart.title}</h2>
              </div>
              <span className="text-[11px] font-medium text-zinc-400">{chart.total} tổng</span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={chart.data} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                      {chart.data.map((entry: any) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e4e4e7",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        fontSize: "13px",
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5 pt-1">
                  {chart.data.map((entry: any) => {
                    const pct = ((entry.value / chart.total) * 100).toFixed(0)
                    return (
                      <div key={entry.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.value}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}