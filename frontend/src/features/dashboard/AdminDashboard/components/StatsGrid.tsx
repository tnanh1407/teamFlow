import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type TimeRangeKey = "all" | "12m" | "6m" | "3m"

const timeRangeOptions: Array<{ key: TimeRangeKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "12m", label: "1 năm" },
  { key: "6m", label: "6 tháng" },
  { key: "3m", label: "3 tháng" },
]

interface Stat {
  label: string
  value: number
  color: string
  icon: LucideIcon
}

interface StatsGridProps {
  stats: Stat[]
  range: TimeRangeKey
  onRangeChange: (range: TimeRangeKey) => void
}

export default function StatsGrid({ stats, range, onRangeChange }: StatsGridProps) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold uppercase text-foreground">
            Thống kê toàn bộ phân hệ
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-muted p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onRangeChange(option.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === option.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="group rounded-3xl border border-border bg-background p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize text-muted-foreground">{stat.label}</p>
                  <div className="mt-4 flex items-end gap-2 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={`${stat.label}-${range}`}
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-4xl font-semibold tracking-tight text-foreground"
                      >
                        {stat.value.toLocaleString("en-US")}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px]"
                style={{
                  backgroundColor: `color-mix(in srgb, ${stat.color} 18%, var(--background))`,
                  color: stat.color,
                }}
              >
                <Icon size={40} strokeWidth={1.8} />
              </div>
            </div>

              <div className="mt-6 flex items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground">
                <ArrowUpRight size={16} className="text-emerald-500" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={range}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {range === "all" ? "Số liệu hiện tại" : "Số liệu theo khoảng đã chọn"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
