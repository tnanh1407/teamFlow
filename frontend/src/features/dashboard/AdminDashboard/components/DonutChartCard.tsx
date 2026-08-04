import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

const chartPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

interface DonutChartCardProps {
  title: string
  data: { name: string; value: number; color?: string }[]
  total: number
  index: number
  palette?: string[]
}

export default function DonutChartCard({ title, data, total, index, palette }: DonutChartCardProps) {
  const colors = palette?.length ? palette : chartPalette

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <TrendingUp size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">{total} tổng</span>
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
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e4e4e7",
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
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.value}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5 + index * 0.15,
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
