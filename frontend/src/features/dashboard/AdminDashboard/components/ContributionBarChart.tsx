import { motion } from "motion/react"
import type { ReactElement } from "react"
import type { TooltipContentProps } from "recharts"
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
  projects?: number
  comments?: number
  tasks?: number
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
  tooltipContent?: ReactElement
}

type ContributionTooltipProps = Partial<Pick<TooltipContentProps<number, string>, "active" | "payload">>

function ContributionTooltip({ active, payload }: ContributionTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ContributionPoint
  const projectBase = point.projects ?? point.value
  const completionRate = projectBase > 0 ? Math.round((point.completed / projectBase) * 100) : 0

  return (
    <div className="min-w-56 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Điểm đóng góp</span>
          <span className="font-semibold text-foreground">{point.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Dự án tham gia</span>
          <span className="font-semibold text-foreground">{projectBase}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Hoàn thành</span>
          <span className="font-semibold text-foreground">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tỷ lệ hoàn thành</span>
          <span className="font-semibold text-foreground">{completionRate}%</span>
        </div>
      </div>
    </div>
  )
}

export type EmployeeContributionTooltipProps = ContributionTooltipProps

export function EmployeeContributionTooltip({ active, payload }: EmployeeContributionTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ContributionPoint
  const completionRate = (point.projects ?? 0) > 0 ? Math.round((point.completed / (point.projects ?? 1)) * 100) : 0

  return (
    <div className="min-w-56 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Điểm đóng góp</span>
          <span className="font-semibold text-foreground">{point.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Dự án tham gia</span>
          <span className="font-semibold text-foreground">{point.projects ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Hoàn thành</span>
          <span className="font-semibold text-foreground">{point.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tỷ lệ hoàn thành</span>
          <span className="font-semibold text-foreground">{completionRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Bình luận</span>
          <span className="font-semibold text-foreground">{point.comments ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Công việc được giao</span>
          <span className="font-semibold text-foreground">{point.tasks ?? 0}</span>
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
  tooltipContent,
}: ContributionBarChartProps) {
  const chartHeight = Math.max(240, data.length * 48 + 40)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-border bg-background shadow-sm"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold uppercase text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="p-5">
        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "var(--chart-label-color)" }}
                  tickLine={true}
                  axisLine={true}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category"
                  dataKey="label"
                  width={180}
                  tick={{ fontSize: 14, fill: "var(--chart-label-color)" }}
                  tickLine={true}
                  axisLine={true}
                />
                <Tooltip content={tooltipContent ?? <ContributionTooltip />} />
                <Bar dataKey="value" fill={accent}  barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  )
}
