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
    <div className="min-w-45 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Mức độ ưu tiên</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{point.name}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Số lượng</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{point.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-600 dark:text-zinc-300">Tỷ lệ</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{percent}%</span>
        </div>
      </div>
    </div>
  )
}
