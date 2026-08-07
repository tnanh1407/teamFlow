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

interface GrowthPoint {
  active: number
  departed: number
  hires: number
  leaves: number
}

interface GrowthTooltipProps {
  active?: boolean
  payload?: Array<{ payload: GrowthPoint }>
}

function GrowthTooltip({ active, payload }: GrowthTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <div className="min-w-55 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.success }} />
            Nhân sự đang làm
          </span>
          <span className="font-semibold text-foreground">{point.active}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.destructive }} />
            Nhân sự đã nghỉ
          </span>
          <span className="font-semibold text-foreground">{point.departed}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.primary }} />
            Nhân sự tuyển mới
          </span>
          <span className="font-semibold text-foreground">{point.hires}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: semanticChartColors.muted }} />
            Nhân sự nghỉ việc
          </span>
          <span className="font-semibold text-foreground">{point.leaves}</span>
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
  if (data.length === 0) return null

  return (
    <ChartCard
      title="Biểu đồ nhân sự"
      subtitle="Theo dõi tuyển mới, nghỉ việc và số lượng đang làm theo thời gian"
      delay={0.5}
      rightContent={<span>{currentTotal} nhân sự hiện đang làm việc</span>}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
            tickLine
            axisLine
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
            stroke={semanticChartColors.success}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.success, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.success, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="departed"
            name="Đã nghỉ"
            stroke={semanticChartColors.destructive}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.destructive, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.destructive, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="hires"
            name="Tuyển mới"
            stroke={semanticChartColors.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: semanticChartColors.primary, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.primary, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="totalHires"
            name="Tổng tuyển"
            stroke={semanticChartColors.muted}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: semanticChartColors.muted, stroke: semanticChartColors.surface, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: semanticChartColors.muted, stroke: semanticChartColors.surface, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
