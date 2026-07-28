import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Users, CheckSquare, Activity, TrendingUp, Gauge, Building2, UserCircle, type LucideIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import userService, { type User } from "@/services/user.service"
import projectService, { type Project } from "@/services/project.service"
import employeeService, { type Employee } from "@/services/employee.service"
import departmentService, { type Department } from "@/services/department.service"

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [, setEmp] = useState<Employee | null>(null)
  const [dept, setDept] = useState<Department | null>(null)
  const [deptMembers, setDeptMembers] = useState<User[]>([])
  const [deptManager, setDeptManager] = useState<Employee | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.position === "member") {
          const [projRes, userRes, empRes, deptRes] = await Promise.all([
            projectService.getMyProjects(),
            userService.getAll(),
            employeeService.getAll(),
            departmentService.getAll(),
          ])
          setProjects(projRes.data.data)
          setMembers(userRes.data.data)

          const myEmp = empRes.data.data.find((e) => e.id === user.employeeId)
          setEmp(myEmp || null)

          if (myEmp?.departmentId) {
            const myDept = deptRes.data.data.find((d) => d.id === myEmp.departmentId)
            setDept(myDept || null)

            if (myDept?.managerId) {
              const mgr = empRes.data.data.find((e) => e.id === myDept.managerId)
              setDeptManager(mgr || null)
            }

            const deptEmpIds = empRes.data.data
              .filter((e) => e.departmentId === myEmp.departmentId)
              .map((e) => e.id)
            const deptUsers = userRes.data.data.filter((u) =>
              deptEmpIds.includes(u.employeeId) && u.id !== user.id
            )
            setDeptMembers(deptUsers)
          }
        } else {
          const [projRes, userRes, empRes, deptRes] = await Promise.all([
            projectService.getMyProjects(),
            userService.getAll(),
            employeeService.getAll(),
            departmentService.getAll(),
          ])
          setProjects(projRes.data.data)
          setMembers(userRes.data.data)

          const myEmp = empRes.data.data.find((e) => e.id === user!.employeeId)
          setEmp(myEmp || null)

          const managedDept = deptRes.data.data.find((d) => d.managerId === user!.employeeId)
          if (managedDept) {
            setDept(managedDept)
            setDeptManager(myEmp || null)

            const deptEmpIds = empRes.data.data
              .filter((e) => e.departmentId === managedDept.id)
              .map((e) => e.id)
            const deptUsers = userRes.data.data.filter((u) =>
              deptEmpIds.includes(u.employeeId) && u.id !== user!.id
            )
            setDeptMembers(deptUsers)
          } else if (myEmp?.departmentId) {
            const myDept = deptRes.data.data.find((d) => d.id === myEmp.departmentId)
            setDept(myDept || null)

            if (myDept?.managerId) {
              const mgr = empRes.data.data.find((e) => e.id === myDept.managerId)
              setDeptManager(mgr || null)
            }

            const deptEmpIds = empRes.data.data
              .filter((e) => e.departmentId === myEmp.departmentId)
              .map((e) => e.id)
            const deptUsers = userRes.data.data.filter((u) =>
              deptEmpIds.includes(u.employeeId) && u.id !== user!.id
            )
            setDeptMembers(deptUsers)
          }
        }
      } catch {
        console.error("Failed to fetch dashboard data")
      }
    }
    fetch()
  }, [user])

  const myProjects = projects
  const activeProjects = myProjects.filter((p) => p.status !== "completed").length
  const completedProjects = myProjects.filter((p) => p.status === "completed").length
  const inReviewCount = myProjects.filter((p) => p.status === "review").length

  const deptMemberCount = deptMembers.length

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
      value: myProjects.length,
      icon: TrendingUp,
      color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    },
  ]

  if (user?.position === "manager") {
    stats.unshift({
      label: dept ? `Phòng ${dept.name}` : "Thành viên",
      value: deptMemberCount,
      icon: Users,
      color: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400",
      onClick: () => navigate("/members"),
    })
  }

  const recentProjects = myProjects.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {user && (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.avatarURL ? (
              <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{(user.username ?? "").slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Xin chào, {user?.username}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {dept ? `${dept.name} · Bảng điều khiển` : "Bảng điều khiển"}
          </p>
        </div>
      </div>

      {/* Department info */}
      {dept && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Building2 size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phòng ban</p>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{dept.name}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{dept.description || dept.code}</p>
            </div>
            {deptManager && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <UserCircle size={32} className="text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quản lí</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{deptManager.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{deptManager.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Trạng thái Dự án */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Trạng thái Dự án</h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Đang làm", value: activeProjects, color: "#f59e0b" },
                    { name: "Đánh giá", value: inReviewCount, color: "#a855f7" },
                    { name: "Hoàn thành", value: completedProjects, color: "#10b981" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: "Đang làm", value: activeProjects, color: "#f59e0b" },
                    { name: "Đánh giá", value: inReviewCount, color: "#a855f7" },
                    { name: "Hoàn thành", value: completedProjects, color: "#10b981" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-zinc-600 dark:text-zinc-400">Đang làm ({activeProjects})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span className="text-zinc-600 dark:text-zinc-400">Đánh giá ({inReviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-zinc-600 dark:text-zinc-400">Hoàn thành ({completedProjects})</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Thống kê chỉ số */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thống kê chỉ số tổng quan</h2>
            <span className="text-xs text-zinc-400 font-medium">Tổng: {myProjects.length} dự án</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Đang làm", value: activeProjects, fill: "#f59e0b" },
                  { name: "Đánh giá", value: inReviewCount, fill: "#a855f7" },
                  { name: "Hoàn thành", value: completedProjects, fill: "#10b981" },
                  { name: "Thành viên PB", value: deptMemberCount, fill: "#06b6d4" },
                ]}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {[
                    { fill: "#f59e0b" },
                    { fill: "#a855f7" },
                    { fill: "#10b981" },
                    { fill: "#06b6d4" },
                  ].map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
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

        {/* Member section */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {dept ? `Phòng ${dept.name}` : "Thành viên"}
            </h2>
            {dept && (
              <span className="text-xs text-zinc-400">{deptMembers.length + 1} thành viên</span>
            )}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(user?.position === "member" || user?.position === "manager") && dept ? (
              <>
                {deptManager && user?.position !== "manager" && (
                  <div className="px-5 py-3 flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {deptManager.avatarURL ? (
                        <img src={deptManager.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{(deptManager.name ?? "").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{deptManager.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Quản lí phòng ban</p>
                    </div>
                  </div>
                )}
                {deptMembers.slice(0, 6).map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {m.avatarURL ? (
                        <img src={m.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{(m.username ?? "").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{(m.username ?? "")}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{(m.employeeId ?? "").slice(0, 8)}...</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${m.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                      {m.status ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </div>
                ))}
                {deptMembers.length > 6 && (
                  <p className="px-5 py-2 text-xs text-zinc-400 text-center">...và {deptMembers.length - 6} thành viên khác</p>
                )}
              </>
            ) : (
              <>
                {members.filter((m) => m.position === "member").slice(0, 5).length === 0 ? (
                  <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có thành viên nào</p>
                ) : (
                  members.filter((m) => m.position === "member").slice(0, 5).map((m) => (
                    <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.avatarURL ? (
                          <img src={m.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{(m.username ?? "").slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{(m.username ?? "")}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{(m.employeeId ?? "").slice(0, 8)}...</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${m.status ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                        {m.status ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
