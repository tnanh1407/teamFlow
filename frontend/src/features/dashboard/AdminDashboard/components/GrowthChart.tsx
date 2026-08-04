import { useMemo, useState } from "react"
import { motion } from "motion/react"
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
import ChartLegend from "./ChartLegend"

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

interface GrowthChartProps {
  data: { month: string; active: number; departed: number; totalHires: number; hires: number; leaves: number }[]
  currentTotal: number
}

type TimeRangeKey = "all" | "12m" | "6m" | "3m"

const timeRangeOptions: Array<{ key: TimeRangeKey; label: string; months: number }> = [
  { key: "all", label: "Tất cả", months: Number.POSITIVE_INFINITY },
  { key: "12m", label: "1 năm", months: 12 },
  { key: "6m", label: "6 tháng", months: 6 },
  { key: "3m", label: "3 tháng", months: 3 },
]

function GrowthTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as {
    active: number 
    departed: number
    hires: number 
    leaves: number // nghỉ
  }

  return (
    <div className="min-w-55 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[1] }} />
            Nhân sự đang làm
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.active}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[4] }} />
            Nhân sự đã nghỉ
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.departed}</span>
        </div>


        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[3] }} />
            Nhân sự tuyển mới
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.hires}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[0] }} />
            Nhân sự nghỉ việc
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.leaves}</span>
        </div>
      </div>
    </div>
  )
}

export default function GrowthChart({ data, currentTotal }: GrowthChartProps) {
  const [range, setRange] = useState<TimeRangeKey>("12m")

  const visibleData = useMemo(() => {
    const selectedMonths = timeRangeOptions.find((option) => option.key === range)?.months ?? 12
    return Number.isFinite(selectedMonths) ? data.slice(-selectedMonths) : data
  }, [data, range])

  const visibleCurrentTotal = visibleData.at(-1)?.active ?? currentTotal

  if (visibleData.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 uppercase">BIỀU ĐỒ NHÂN SỰ</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
            {timeRangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  range === option.key
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-zinc-400">
            {visibleCurrentTotal} nhân sự hiện tại đang làm việc
          </span>
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={visibleData} margin={{ top: 8, right: 16, left: 24, bottom: 24 }} >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
              tickLine={false}
              axisLine={false}
              height={36}
              label={{
                value: "Tháng",
                position: "bottom",
                offset: 8,
                style: { fill: "var(--chart-label-color)" },
              }}
            />
            <YAxis
              width={72}
              tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
              tickLine={true}
              axisLine={true}
              label={{
                value: "Thành viên",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: { textAnchor: "middle", fill: "var(--chart-label-color)" },
              }}
            />
            <Tooltip content={<GrowthTooltip />} />
            <Legend content={<ChartLegend />} verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 20 }} />
            <Line
              type="monotone"
              dataKey="active"
              name="Đang làm"
              stroke={chartPalette[1]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[1], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[1], stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="departed"
              name="Đã nghỉ"
              stroke={chartPalette[4]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[4], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[4], stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="hires"
              name="Tuyển mới"
              stroke={chartPalette[3]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartPalette[3], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[3], stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="totalHires"
              name="Tổng tuyển"
              stroke={chartPalette[0]}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 4, fill: chartPalette[0], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: chartPalette[0], stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
