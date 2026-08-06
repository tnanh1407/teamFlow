import { useMemo, useState } from "react"
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
import ChartLegend from "./ChartLegend"
import ChartCard from "@/shared/ui/ChartCard"
import { chartPalette } from "@/shared/ui/chartColors"

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

interface ProjectOverviewTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ProjectOverviewPoint
  }>
}

type TimeRangeKey = "all" | "12m" | "6m" | "3m"

const timeRangeOptions: Array<{ key: TimeRangeKey; label: string; months: number }> = [
  { key: "all", label: "Tất cả", months: Number.POSITIVE_INFINITY },
  { key: "12m", label: "1 năm", months: 12 },
  { key: "6m", label: "6 tháng", months: 6 },
  { key: "3m", label: "3 tháng", months: 3 },
]

function ProjectOverviewTooltip({ active, payload }: ProjectOverviewTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ProjectOverviewPoint

  return (
    <div className="min-w-55 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">

      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[0] }} />
            Tổng dự án
          </span>
          <span className="font-semibold text-foreground">{point.total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[2] }} />
            Đã hoàn thành
          </span>
          <span className="font-semibold text-foreground">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartPalette[4] }} />
            Chưa hoàn thành
          </span>
          <span className="font-semibold text-foreground">{point.incomplete}</span>
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
  const [range, setRange] = useState<TimeRangeKey>("12m")

  const visibleData = useMemo(() => {
    const selectedMonths = timeRangeOptions.find((option) => option.key === range)?.months ?? 12
    return Number.isFinite(selectedMonths) ? data.slice(-selectedMonths) : data
  }, [data, range])

  if (visibleData.length === 0) return null

  return (
    <ChartCard
      title="Tổng quan dự án"
      subtitle="Tình trạng và tiến độ dự án theo thời gian"
      delay={0.6}
      rightContent={
        <>
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${range === option.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {currentTotal} dự án, {completedTotal} hoàn thành, {incompleteTotal} chưa hoàn thành
          </span>
        </>
      }
    >
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={visibleData} margin={{ top: 8, right: 16, left: 24, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
              tickLine={true}
              axisLine={true}
              allowDecimals={false}
              height={36}
              label={{
                value: "Thời gian (Tháng / Năm )",
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
              allowDecimals={false}
              label={{
                value: "Dự án",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: { textAnchor: "middle", fill: "var(--chart-label-color)" },
              }}
            />
            <Tooltip content={<ProjectOverviewTooltip />} />
            <Legend content={<ChartLegend />} verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 20 }} />
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
      </div>
    </ChartCard>
  )
}
