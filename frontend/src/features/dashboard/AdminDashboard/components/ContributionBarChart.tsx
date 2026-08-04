import { motion } from "motion/react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ContributionPoint {
  label: string
  name: string
  value: number
  completed: number
  comments: number
  processes: number
  code?: string
  department?: string
  position?: string
}

interface ContributionBarChartProps {
  title: string
  description: string
  data: ContributionPoint[]
  accent?: string
  emptyText: string
}

function ContributionTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ContributionPoint
  const completionRate = point.value > 0 ? Math.round((point.completed / point.value) * 100) : 0

  return (
    <div className="min-w-56 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Tổng dự án tham gia</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Hoàn thành</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Tỷ lệ hoàn thành</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{completionRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Bình luận</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.comments}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Quy trình</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.processes}</span>
        </div>
      </div>
    </div>
  )
}

export default function ContributionBarChart({
  title,
  description,
  data,
  accent = "var(--chart-1)",
  emptyText,
}: ContributionBarChartProps) {
  const chartHeight = Math.max(240, data.length * 48 + 40)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900"
    >
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-base font-semibold uppercase text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="p-5">
        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-400 dark:border-zinc-700">
            {emptyText}
          </div>
        ) : (
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={180}
                  tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ContributionTooltip />} />
                <Bar dataKey="value" fill={accent} radius={[0, 10, 10, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  )
}
