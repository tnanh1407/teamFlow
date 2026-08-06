import type { TooltipContentProps } from "recharts"

interface DepartmentPoint {
  name: string
  value: number
  members?: number
  staff?: number
  interns?: number
  managerName?: string
  managerCode?: string | null
  color?: string
}

type DepartmentTooltipProps = Partial<Pick<TooltipContentProps<number, string>, "active" | "payload">>

export default function DepartmentTooltip({ active, payload }: DepartmentTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload as DepartmentPoint
  const totalMembers = point.members ?? point.value
  const staffCount = point.staff ?? 0
  const internCount = point.interns ?? 0
  const managerCode = point.managerCode?.trim() || ""

  return (
    <div className="min-w-64 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phòng ban</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{point.name}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Tổng thành viên</span>
          <span className="font-semibold text-foreground">{totalMembers}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Nhân sự</span>
          <span className="font-semibold text-foreground">{staffCount}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">TTS</span>
          <span className="font-semibold text-foreground">{internCount}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">Quản lí</span>
          <span className="max-w-40 text-right font-semibold text-foreground">
            {point.managerName ? `${point.managerName}${managerCode ? ` (${managerCode})` : ""}` : "Chưa phân công"}
          </span>
        </div>
      </div>
    </div>
  )
}
