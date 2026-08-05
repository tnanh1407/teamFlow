import { useState } from "react"
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
import ChartCard from "@/shared/ui/ChartCard"
import { chartPalette } from "@/shared/ui/chartColors"




type TimeRangeKey = "all" | "12m" | "6m" | "3m" 

const timeRangeOptions: Array<{ key: TimeRangeKey; label: string; months: number }> = [
  { key: "all", label: "Tất cả", months: Number.POSITIVE_INFINITY },
  { key: "12m", label: "1 năm", months: 12 },
  { key: "6m", label: "6 tháng", months: 6 },
  { key: "3m", label: "3 tháng", months: 3 },
]


// type cho GrowthTooltip 
interface GrowthPoint {
  active : number // nhân sự đang làm
  departed : number // nhân sự đã nghỉ
  hires : number // nhân sự mới
  leaves : number // nhân sự đã nghỉ
}

interface GrowthTooltipProps {
  active? : boolean
  payload? : Array<{payload:GrowthPoint }>
} 


function GrowthTooltip({ active, payload }: GrowthTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as GrowthPoint

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

interface EmployeeTrendChartProps {
  data: { month: string; active: number; departed: number; totalHires: number; hires: number; leaves: number }[]
  currentTotal: number
}

export default function EmployeeTrendChart({ data, currentTotal }: EmployeeTrendChartProps) {
  const [range, setRange] = useState<TimeRangeKey>("12m") // phạm vi thời gian

  const selectedMonths = timeRangeOptions.find((option) => option.key === range)?.months ?? 12
  const visibleData = Number.isFinite(selectedMonths) ? data.slice(-selectedMonths) : data

  if (visibleData.length === 0) return null

  return (
    <ChartCard
      title="Biểu đồ nhân sự"
      subtitle="Theo dõi tuyển mới, nghỉ việc và số lượng đang làm theo thời gian"
      delay={0.5}
      rightContent={
        <>
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
            {currentTotal} nhân sự hiện tại đang làm việc
          </span>
        </>
      }
    >
      <div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={visibleData} margin={{ top: 8, right: 16, left: 24, bottom: 24 }} >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
              tickLine={true}
              axisLine={true}
              height={36}
              label={{
                value: "Thời gian (Tháng / Năm)",
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
                value: "Nhân sự (Người)",
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
    </ChartCard>
  )
}
