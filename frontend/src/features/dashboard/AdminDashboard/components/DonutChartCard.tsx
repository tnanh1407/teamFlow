import { motion } from "motion/react"
import type { ReactElement } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { chartPalette } from "@/shared/ui/chartColors"

interface DonutChartCardProps {
  title: string
  data: { name: string; value: number; color?: string }[]
  total: number
  tooltipContent?: ReactElement
}

export default function DonutChartCard({ title, data, total, tooltipContent }: DonutChartCardProps) {
  const colors = chartPalette

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span className="text-sm font-medium text-muted-foreground">{total} tổng</span>
      </div>

      <div className="p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start">
          <ResponsiveContainer width="100%" height={208}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={3} dataKey="value">
                {data.map((entry, entryIndex) => (
                  <Cell key={entry.name} fill={entry.color ?? colors[entryIndex % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={tooltipContent}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  boxShadow: "0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)",
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {data.map((entry, entryIndex) => {
              const color = entry.color ?? colors[entryIndex % colors.length]
              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0"

              return (
                <div key={entry.name} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="truncate text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-semibold text-foreground">{entry.value}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground">{pct}%</span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
