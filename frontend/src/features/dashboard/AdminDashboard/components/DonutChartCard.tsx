import { motion } from "motion/react"
import type { ReactElement } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
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
      className="rounded-xl border border-border bg-background shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold uppercase text-foreground">{title}</h2>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{total} tổng</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
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
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5 pt-1">
            {data.map((entry, entryIndex) => {
              const color = entry.color ?? colors[entryIndex % colors.length]
              const pct = ((entry.value / total) * 100).toFixed(0)
              return (
                <div key={entry.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{entry.value}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5,
                        ease: "easeOut",
                      }}
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
