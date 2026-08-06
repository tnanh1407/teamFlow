import { chartPalette } from "@/shared/ui/chartColors"

interface ChartLegendEntry {
  value?: string
  color?: string
}

export default function ChartLegend({ payload }: { payload?: ChartLegendEntry[] }) {
  if (!payload?.length) return null

  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color ?? chartPalette[0] }} />
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
