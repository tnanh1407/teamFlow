import { motion } from "motion/react"
import { Briefcase } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts"

const chartPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

interface ProjectOverviewPoint {
  month: string
  total: number
  completed: number
  incomplete: number
}

interface ProjectOverviewChartProps {
  data: ProjectOverviewPoint[]
  currentTotal: number
  completedTotal: number
  incompleteTotal: number
}

function ProjectOverviewTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ProjectOverviewPoint

  return (
    <div className="min-w-[220px] rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Tháng</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Tổng dự án</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Đã hoàn thành</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Chưa hoàn thành</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.incomplete}</span>
        </div>
      </div>
    </div>
  )
}

export default function ProjectOverviewChart({
  data,
  currentTotal,
  completedTotal,
  incompleteTotal,
}: ProjectOverviewChartProps) {
  if (data.length <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <Briefcase size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tổng quan dự án</h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">{currentTotal} dự án hiện tại</span>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ProjectOverviewTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Tổng dự án"
              stroke={chartPalette[0]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[0], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[0], stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Đã hoàn thành"
              stroke={chartPalette[2]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[2], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[2], stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="incomplete"
              name="Chưa hoàn thành"
              stroke={chartPalette[4]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[4], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[4], stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tổng dự án</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{currentTotal}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Đã hoàn thành</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{completedTotal}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Chưa hoàn thành</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{incompleteTotal}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
