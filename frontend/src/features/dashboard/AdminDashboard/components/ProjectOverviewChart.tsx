import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ChartLegend from "./ChartLegend"
import ChartCard from "@/shared/ui/ChartCard"
import { semanticChartColors } from "@/shared/ui/chartColors"

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

function ProjectOverviewTooltip({ active, payload }: ProjectOverviewTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div className="min-w-55 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.primary }} />
            Tổng dự án
          </span>
          <span className="font-semibold text-foreground">{point.total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.success }} />
            Đã hoàn thành
          </span>
          <span className="font-semibold text-foreground">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.warning }} />
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
  if (data.length === 0) return null

  return (
    <ChartCard
      title="Tổng quan dự án"
      subtitle="Tình trạng và tiến độ dự án theo thời gian"
      delay={0.6}
      rightContent={<span>{currentTotal} dự án, {completedTotal} hoàn thành, {incompleteTotal} chưa hoàn thành</span>}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
            tickLine
            axisLine
            allowDecimals={false}
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
            tickLine
            axisLine
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
            stroke={semanticChartColors.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.primary, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.primary, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="Đã hoàn thành"
            stroke={semanticChartColors.success}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.success, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.success, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="incomplete"
            name="Chưa hoàn thành"
            stroke={semanticChartColors.warning}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.warning, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.warning, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
