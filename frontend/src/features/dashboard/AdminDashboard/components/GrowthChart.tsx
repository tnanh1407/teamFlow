import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface GrowthChartProps {
  data: { month: string; active: number; departed: number; totalHires: number; hires: number; leaves: number }[]
  currentTotal: number
}

function GrowthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as {
    month: string
    active: number
    departed: number
    totalHires: number
    hires: number
    leaves: number
  }

  return (
    <div className="min-w-[220px] rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Tháng</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tổng tuyển {point.totalHires}</span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Đang làm</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.active}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Đã nghỉ</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.departed}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="rounded-lg bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60">
            <p className="text-zinc-500 dark:text-zinc-400">Tuyển mới</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{point.hires}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 px-2.5 py-2 dark:bg-zinc-800/60">
            <p className="text-zinc-500 dark:text-zinc-400">Nghỉ việc</p>
            <p className="mt-0.5 font-semibold text-zinc-900 dark:text-zinc-100">{point.leaves}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GrowthChart({ data, currentTotal }: GrowthChartProps) {
  if (data.length <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <TrendingUp size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nhân sự đang làm</h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">{currentTotal} đang làm hiện tại</span>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<GrowthTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="active"
              name="Đang làm"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="departed"
              name="Đã nghỉ"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="totalHires"
              name="Tổng tuyển"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
