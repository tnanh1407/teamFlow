import type { TooltipContentProps } from "recharts"

interface ProjectPriorityPoint {
  name: string
  value: number
  color?: string
}

interface ProjectPriorityTooltipProps {
  total: number
}

type TooltipProps = Partial<Pick<TooltipContentProps<number, string>, "active" | "payload">> & ProjectPriorityTooltipProps

export default function ProjectPriorityTooltip({ active, payload, total }: TooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as ProjectPriorityPoint
  const percent = total > 0 ? Math.round((point.value / total) * 100) : 0

  return (
    <div className="min-w-45 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">Mức độ ưu tiên</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{point.name}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Số lượng</span>
          <span className="font-semibold text-foreground">{point.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tỷ lệ</span>
          <span className="font-semibold text-foreground">{percent}%</span>
        </div>
      </div>
    </div>
  )
}
