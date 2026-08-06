import type { TooltipContentProps } from "recharts"

interface DepartmentPoint {
  name: string
  value: number
  color?: string
}

type DepartmentTooltipProps = Partial<Pick<TooltipContentProps<number, string>, "active" | "payload">>

export default function DepartmentTooltip({ active, payload }: DepartmentTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as DepartmentPoint

  return (
    <div className="min-w-45 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Phòng ban</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {point.name} : {point.value} thành viên
      </p>
    </div>
  )
}
