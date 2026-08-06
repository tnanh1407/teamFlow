import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Briefcase, CheckCircle2, ClipboardList, CircleDashed, UserCheck, UserX, Users, type LucideIcon } from "lucide-react"
import PageHeader from "@/shared/ui/PageHeader"
import LoadingState from "@/shared/ui/LoadingState"
import PageSeo from "@/shared/ui/PageSeo"
import { chartPalette } from "@/shared/ui/chartColors"
import StatsGrid from "./components/StatsGrid"
import EmployeeTrendChart from "./components/GrowthChart"
import DonutChartCard from "./components/DonutChartCard"
import DepartmentTooltip from "./components/DepartmentTooltip"
import ProjectPriorityTooltip from "./components/ProjectPriorityTooltip"
import ProjectOverviewChart from "./components/ProjectOverviewChart"
import ContributionBarChart from "./components/ContributionBarChart"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import projectService, { type Project } from "@/services/project.service"
import projectDepartmentService, { type ProjectDepartment } from "@/services/project-department.service"
import projectEmployeeService, { type ProjectEmployee } from "@/services/project-employee.service"
import projectCommentService, { type ProjectComment } from "@/services/project-comment.service"
import projectLogService, { type ProjectLog } from "@/services/project-log.service"



interface DashboardChartPoint {
  name: string
  value: number
  color?: string
}





type TimeRangeKey = "all" | "12m" | "6m" | "3m"

const timeRangeOptions: Array<{ key: TimeRangeKey; label: string; months: number }> = [
  { key: "all", label: "Tất cả", months: Number.POSITIVE_INFINITY },
  { key: "12m", label: "1 năm", months: 12 },
  { key: "6m", label: "6 tháng", months: 6 },
  { key: "3m", label: "3 tháng", months: 3 },
]

function getRangeMonths(range: TimeRangeKey) {
  return timeRangeOptions.find((option) => option.key === range)?.months ?? 12
}

function getPreviousRangeWindow(range: TimeRangeKey) {
  const selectedMonths = getRangeMonths(range)
  if (!Number.isFinite(selectedMonths)) return null

  const today = new Date()
  const currentStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (selectedMonths - 1), 1))
  const currentEnd = new Date()
  const previousEnd = new Date(currentStart)
  previousEnd.setUTCMilliseconds(previousEnd.getUTCMilliseconds() - 1)
  const previousStart = new Date(Date.UTC(previousEnd.getUTCFullYear(), previousEnd.getUTCMonth() - (selectedMonths - 1), 1))

  return { currentStart, currentEnd, previousStart, previousEnd }
}

function countCreatedUpTo<T>(items: T[], end: Date, getDate: (item: T) => string | null | undefined) {
  return items.filter((item) => isBeforeOrAt(getDate(item), end)).length
}

function isBeforeOrAt(value: string | null | undefined, end: Date) {
  if (!value) return false

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return false

  return timestamp <= end.getTime()
}

function getProjectCompletedAt(project: Project) {
  return project.completedAt || (project.status === "completed" ? project.updatedAt : null)
}

function countUsersActiveAt(users: User[], end: Date) {
  return users.filter((user) => isBeforeOrAt(user.hireDate, end) && (!user.leaveDate || new Date(user.leaveDate).getTime() > end.getTime())).length
}

function countUsersDepartedAt(users: User[], end: Date) {
  return users.filter((user) => isBeforeOrAt(user.leaveDate, end)).length
}

function countDepartmentsAt(departments: Department[], end: Date) {
  return countCreatedUpTo(departments, end, (department) => department.createdAt)
}

function countPositionsAt(positions: Position[], end: Date) {
  return countCreatedUpTo(positions, end, (position) => position.createdAt)
}

function countProjectsAt(projects: Project[], end: Date) {
  return countCreatedUpTo(projects, end, (project) => project.createdAt)
}

function countCompletedProjectsAt(projects: Project[], end: Date) {
  return projects.filter((project) => isBeforeOrAt(getProjectCompletedAt(project), end)).length
}

function countIncompleteProjectsAt(projects: Project[], end: Date) {
  const created = countProjectsAt(projects, end)
  const completed = countCompletedProjectsAt(projects, end)
  return Math.max(created - completed, 0)
}

function formatComparisonLabel(range: TimeRangeKey) {
  if (range === "12m") return "1 năm trước"
  if (range === "6m") return "6 tháng trước"
  if (range === "3m") return "3 tháng trước"
  return ""
}

function formatComparisonText(currentValue: number, previousValue: number | null, range: TimeRangeKey) {
  if (range === "all" || previousValue === null) {
    return {
      trendText: "Số liệu hệ thống hiện tại",
      trendPercentText: "",
      trendDeltaText: "",
      trendDirection: "flat" as const,
    }
  }

  const delta = currentValue - previousValue 
  const label = formatComparisonLabel(range)

  if (previousValue === 0) {
    if (currentValue === 0) {
      return {
        trendText: `Không đổi so với ${label}`,
        trendPercentText: "",
        trendDeltaText: "",
        trendDirection: "flat" as const,
      }
    }

    return {
      trendText: `Mới so với ${label}`,
      trendPercentText: "",
      trendDeltaText: `${delta > 0 ? "+" : ""}${delta.toLocaleString("en-US")}`,
      trendDirection: delta > 0 ? ("up" as const) : ("down" as const),
    }
  }

  const percent = Math.round((delta / previousValue) * 100)
  if (percent === 0) {
    return {
      trendText: `Không đổi so với ${label}`,
      trendPercentText: "",
      trendDeltaText: "",
      trendDirection: "flat" as const,
    }
  }

  return {
    trendText: `so với ${label}`,
    trendPercentText: `${Math.abs(percent)}%`,
    trendDeltaText: `${delta > 0 ? "+" : ""}${delta.toLocaleString("en-US")}`,
    trendDirection: delta > 0 ? ("up" as const) : ("down" as const),
  }
}



const departmentPalette = chartPalette

const projectPalette = {
  low: "var(--chart-7)",
  medium: "var(--chart-3)",
  high: "var(--chart-2)",
  critical: "var(--chart-5)",
}

function buildActiveDepartmentData(users: User[], departments: Department[]): DashboardChartPoint[] {
  const activeUsers = users.filter((user) => user.status === true)

  return departments
    .map((department) => ({
      name: department.name,
      value: activeUsers.filter((user) => user.departmentId === department.id).length,
    }))
    .filter((department) => department.value > 0)
}

function buildDepartmentContributionData(
  projects: Project[],
  departments: Department[],
  assignments: ProjectDepartment[]
): DashboardContributionPoint[] {
  const projectById = new Map(projects.map((project) => [project.id, project]))
  const counts = new Map<string, { total: Set<string>; completed: Set<string> }>()

  assignments.forEach((assignment) => {
    const project = projectById.get(assignment.projectId)
    if (!project) return

    const current = counts.get(assignment.departmentId) ?? { total: new Set<string>(), completed: new Set<string>() }
    current.total.add(project.id)
    if (project.status === "completed") current.completed.add(project.id)
    counts.set(assignment.departmentId, current)
  })

  return departments
    .map((department) => {
      const count = counts.get(department.id)
      return {
        label: department.name,
        name: department.name,
        value: count?.total.size ?? 0,
        completed: count?.completed.size ?? 0,
        comments: 0,
        processes: 0,
      }
    })
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value

      const aRate = a.value > 0 ? a.completed / a.value : 0
      const bRate = b.value > 0 ? b.completed / b.value : 0
      if (bRate !== aRate) return bRate - aRate

      if (b.completed !== a.completed) return b.completed - a.completed

      return a.name.localeCompare(b.name)
    })
}


//=========================================== 
// BIỂU ĐỒ NHÂN VIÊN ĐÓNG GÓP
// ==========================================
interface DashboardContributionPoint {
  label: string
  name: string
  value: number
  completed: number
  comments: number
  processes: number
}

function buildEmployeeContributionData(
  projects: Project[],
  users: User[],
  departments: Department[],
  positions: Position[],
  assignments: ProjectEmployee[],
  comments: ProjectComment[], // bình luận
): DashboardContributionPoint[] {
  const projectById = new Map(projects.map((project) => [project.id, project])) // tra cứ nhanh project id
  const departmentById = new Map(departments.map((department) => [department.id, department.name]))
  const positionById = new Map(positions.map((position) => [position.id, position.name]))
  const activeUsers = users.filter((user) => user.status === true)  // lọc nhân viên
  const activeUserIds = new Set(activeUsers.map((user) => user.id)) // kiểm tra nhanh nhân viên có active hay không
  const commentCounts = new Map<string, number>() // lưu số bình luận của từng user
  const processCounts = new Map<string, number>() 
  const counts = new Map<string, { total: Set<string>; completed: Set<string> }>() // lưu số dự án  user tham gia và số dự án hoàn thành trong đó

  comments.forEach((comment) => {
    if (!activeUserIds.has(comment.userId)) return
    commentCounts.set(comment.userId, (commentCounts.get(comment.userId) ?? 0) + 1)
  })

  //  dếm dự án tham gia
  assignments.forEach((assignment) => {
    // user không active thì bỏ qiua
    if (!activeUserIds.has(assignment.userId)) return 

    const project = projectById.get(assignment.projectId)
    if (!project) return

    const current = counts.get(assignment.userId) ?? { total: new Set<string>(), completed: new Set<string>() }
    current.total.add(project.id)
    if (project.status === "completed") current.completed.add(project.id)
    counts.set(assignment.userId, current)
  })

  return activeUsers
    .map((user) => {
      const count = counts.get(user.id)
      return {
        label: `${user.employeeCode || "—"} - ${user.name}`,
        name: user.name,
        value: count?.total.size ?? 0,
        completed: count?.completed.size ?? 0,
        comments: commentCounts.get(user.id) ?? 0,
        processes: processCounts.get(user.id) ?? 0,
        code: user.employeeCode || "",
        department: departmentById.get(user.departmentId ?? "") ?? "",
        position: positionById.get(user.positionId ?? "") ?? "",
      }
    })
    .filter((user) => user.value > 0 || user.comments > 0 || user.processes > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}


// 
function buildProjectPriorityData(projects: Project[]): DashboardChartPoint[] {
  const incompleteProjects = projects.filter((project) => project.status !== "completed")

  return [
    { name: "Thấp", value: incompleteProjects.filter((project) => project.priority === "low").length, color: projectPalette.low },
    { name: "Trung bình", value: incompleteProjects.filter((project) => project.priority === "medium").length, color: projectPalette.medium },
    { name: "Cao", value: incompleteProjects.filter((project) => project.priority === "high").length, color: projectPalette.high },
    { name: "Khẩn cấp", value: incompleteProjects.filter((project) => project.priority === "critical").length, color: projectPalette.critical },
  ].filter((project) => project.value > 0)
}

// data cho biểu đồ project lineChart
interface ProjectOverviewPoint {
  month: string
  total: number
  completed: number
  incomplete: number
}

function buildProjectOverviewData(projects: Project[]): ProjectOverviewPoint[] {
  const monthEvents: Record<string, { created: number; completed: number }> = {}
  const monthKeys = new Set<string>()

  projects.forEach((project) => {
    if (project.createdAt) {
      const createdKey = project.createdAt.slice(0, 7) // lấy từ vị trí 0 -> 7
      monthEvents[createdKey] = monthEvents[createdKey] || { created: 0, completed: 0 }
      monthEvents[createdKey].created += 1
      monthKeys.add(createdKey)
    }

    if (project.completedAt) {
      const completedKey = project.completedAt.slice(0, 7)
      monthEvents[completedKey] = monthEvents[completedKey] || { created: 0, completed: 0 }
      monthEvents[completedKey].completed += 1
      monthKeys.add(completedKey)
    } else if (project.status === "completed" && project.updatedAt) {
      const completedKey = project.updatedAt.slice(0, 7)
      monthEvents[completedKey] = monthEvents[completedKey] || { created: 0, completed: 0 }
      monthEvents[completedKey].completed += 1
      monthKeys.add(completedKey)
    }
  })

  const sortedMonths = Array.from(monthKeys).sort()
  if (sortedMonths.length === 0) return []

  const start = new Date(`${sortedMonths[0]}-01T00:00:00Z`)
  const today = new Date()
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
  const result: ProjectOverviewPoint[] = []
  let total = 0
  let completed = 0

  for (const cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
    const key = cursor.toISOString().slice(0, 7)
    const monthEvent = monthEvents[key] || { created: 0, completed: 0 }
    total += monthEvent.created
    completed += monthEvent.completed
    const incomplete = Math.max(total - completed, 0)
    const [year, month] = key.split("-")
    result.push({
      month: `${Number.parseInt(month, 10)}/${year}`,
      total,
      completed,
      incomplete,
    })
  }

  return result
}

// dữ liệu cho biểu đồ nhân sự

interface DashboardGrowthPoint {
  month: string
  active: number
  departed: number
  totalHires: number
  hires: number
  leaves: number
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
  const today = new Date()
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
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
      month: `${Number.parseInt(month, 10)}/${year}`,
      active,
      departed,
      totalHires,
      hires: monthEvent.hires,
      leaves: monthEvent.leaves,
    })
  }

  return result
}

interface DashboardStat {
  label: string
  value: number
  color: string
  icon: LucideIcon
  trendText: string
  trendPercentText: string
  trendDeltaText: string
  trendDirection: "up" | "down" | "flat"
  href: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [projectDepartments, setProjectDepartments] = useState<ProjectDepartment[]>([])
  const [projectEmployees, setProjectEmployees] = useState<ProjectEmployee[]>([])
  const [projectComments, setProjectComments] = useState<ProjectComment[]>([])
  const [projectLogs, setProjectLogs] = useState<ProjectLog[]>([])
  const [range, setRange] = useState<TimeRangeKey>("12m")
  const [loading, setLoading] = useState(true)


  // UseEffect dữ liệu
  useEffect(() => {
    let alive = true

    const fetchDashboard = async () => {
      try {
        const [usersRes, deptRes, posRes, projRes, projectDepartmentsRes, projectEmployeesRes, projectCommentsRes, projectLogsRes] = await Promise.all([
          userService.getAll(),
          departmentService.getAll(),
          positionService.getAll(),
          projectService.getAll({ limit: 100 }),
          projectDepartmentService.getAll(),
          projectEmployeeService.getAll(),
          projectCommentService.getAll(),
          projectLogService.getAll(),
        ])

        if (!alive) return

        setUsers(usersRes.data.data)
        setProjects(projRes.data.data) // lấy dữ liệu dự án
        setDepartments(deptRes.data.data)
        setPositions(posRes.data.data)
        setProjectDepartments(projectDepartmentsRes.data.data)
        setProjectEmployees(projectEmployeesRes.data.data)
        setProjectComments(projectCommentsRes.data.data)
        setProjectLogs(projectLogsRes.data.data)
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

  const completedProjectsCount = projects.filter((project) => project.status === "completed").length
  const incompleteProjectsCount = projects.length - completedProjectsCount
  const activeUsersCount = countUsersActiveAt(users, new Date())

  const stats = useMemo(() => {
    const window = getPreviousRangeWindow(range)
    const rangeEnd = window?.currentEnd ?? new Date()
    const previousEnd = window?.previousEnd ?? null

    const currentPrevious = range === "all" || !previousEnd
      ? null
      : {
          totalAccounts: countCreatedUpTo(users, previousEnd, (user) => user.createdAt),
          activeUsers: countUsersActiveAt(users, previousEnd),
          departedUsers: countUsersDepartedAt(users, previousEnd),
          departments: countDepartmentsAt(departments, previousEnd),
          positions: countPositionsAt(positions, previousEnd),
          completedProjects: countCompletedProjectsAt(projects, previousEnd),
          totalProjects: countProjectsAt(projects, previousEnd),
          incompleteProjects: countIncompleteProjectsAt(projects, previousEnd),
        }

    const filteredStats: DashboardStat[] = [
      {
        label: "Tổng tài khoản",
        value: countCreatedUpTo(users, rangeEnd, (user) => user.createdAt),
        color: chartPalette[0],
        icon: Users,
        href: "/users",
        ...formatComparisonText(
          countCreatedUpTo(users, rangeEnd, (user) => user.createdAt),
          currentPrevious?.totalAccounts ?? null,
          range
        ),
      },
      {
        label: "Đang làm",
        value: countUsersActiveAt(users, rangeEnd),
        color: chartPalette[1],
        icon: UserCheck,
        href: "/users",
        ...formatComparisonText(
          countUsersActiveAt(users, rangeEnd),
          currentPrevious?.activeUsers ?? null,
          range
        ),
      },
      {
        label: "Đã nghỉ",
        value: countUsersDepartedAt(users, rangeEnd),
        color: chartPalette[2],
        icon: UserX,
        href: "/users",
        ...formatComparisonText(
          countUsersDepartedAt(users, rangeEnd),
          currentPrevious?.departedUsers ?? null,
          range
        ),
      },
      {
        label: "Phòng ban",
        value: countDepartmentsAt(departments, rangeEnd),
        color: chartPalette[3],
        icon: Building2,
        href: "/departments",
        ...formatComparisonText(
          countDepartmentsAt(departments, rangeEnd),
          currentPrevious?.departments ?? null,
          range
        ),
      },
      {
        label: "Chức vụ",
        value: countPositionsAt(positions, rangeEnd),
        color: chartPalette[4],
        icon: Briefcase,
        href: "/positions",
        ...formatComparisonText(
          countPositionsAt(positions, rangeEnd),
          currentPrevious?.positions ?? null,
          range
        ),
      },
      {
        label: "Dự án hoàn thành",
        value: countCompletedProjectsAt(projects, rangeEnd),
        color: chartPalette[5],
        icon: CheckCircle2,
        href: "/projects",
        ...formatComparisonText(
          countCompletedProjectsAt(projects, rangeEnd),
          currentPrevious?.completedProjects ?? null,
          range
        ),
      },
      {
        label: "Tổng dự án",
        value: countProjectsAt(projects, rangeEnd),
        color: chartPalette[6],
        icon: ClipboardList,
        href: "/projects",
        ...formatComparisonText(
          countProjectsAt(projects, rangeEnd),
          currentPrevious?.totalProjects ?? null,
          range
        ),
      },
      {
        label: "Dự án chưa hoàn thành",
        value: countIncompleteProjectsAt(projects, rangeEnd),
        color: chartPalette[7],
        icon: CircleDashed,
        href: "/projects",
        ...formatComparisonText(
          countIncompleteProjectsAt(projects, rangeEnd),
          currentPrevious?.incompleteProjects ?? null,
          range
        ),
      },
    ]

    return filteredStats
  }, [departments, positions, projects, range, users])

  const growthData = buildGrowthData(users)
  const deptData = buildActiveDepartmentData(users, departments)
  const projPriorityData = buildProjectPriorityData(projects)
  const projectOverviewData = buildProjectOverviewData(projects)
  const departmentContributionData = buildDepartmentContributionData(projects, departments, projectDepartments) // biều đồ phòng ban đóng góp
  const employeeContributionData = buildEmployeeContributionData( // biểu đồ nhân viên đóng góp
    projects,
    users,
    departments,
    positions,
    projectEmployees,
    projectComments,
    projectLogs
  )

  if (loading) {
    return <LoadingState className="h-96" />
  }

  return (
      <div className="space-y-8">
      <PageSeo
        title="Dashboard Admin"
        description="Thống kê tổng quan toàn bộ thông số trong hệ thống TeamFlow"
      />
      <PageHeader title="Dashboard" desc="Thống kê tổng quan toàn bộ thông số trong hệ thống" />
      <StatsGrid
        stats={stats}
        range={range}
        onRangeChange={setRange}
        onCardClick={(href) => navigate(href)}
      />
      <EmployeeTrendChart data={growthData} currentTotal={activeUsersCount} />
      <ProjectOverviewChart
        data={projectOverviewData}
        currentTotal={projects.length}
        completedTotal={completedProjectsCount}
        incompleteTotal={incompleteProjectsCount}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContributionBarChart
          title="Đóng góp dự án theo phòng ban"
          description="Xếp hạng phòng ban theo số dự án được phân công."
          data={departmentContributionData}
          accent="var(--chart-2)"
          emptyText="Chưa có dữ liệu phân công cho phòng ban"
        />
        <ContributionBarChart
          title="Đóng góp dự án theo nhân sự"
          description="Xếp hạng nhân sự đang hoạt động theo số dự án tham gia."
          data={employeeContributionData}
          accent="var(--chart-1)"
          emptyText="Chưa có dữ liệu phân công cho nhân sự"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChartCard
          title="Phân bố nhân sự đang hoạt động theo phòng ban"
          data={deptData}
          total={activeUsersCount || 1}
          index={0}
          palette={departmentPalette}
          tooltipContent={<DepartmentTooltip />}
        />
        <DonutChartCard
          title="Phân bố độ ưu tiên dự án chưa hoàn thành"
          data={projPriorityData}
          total={incompleteProjectsCount || 1}
          index={1}
          tooltipContent={<ProjectPriorityTooltip total={incompleteProjectsCount || 1} />}
        />
      </div>
    </div>
  )
}
