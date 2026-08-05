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
    <section className="rounded-xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className=" text-base text-zinc-900 dark:text-zinc-400 uppercase font-semibold">Thống kê toàn bộ phân hệ</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
          {timeRangeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onRangeChange(option.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === option.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
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
              className="group rounded-[28px] border border-zinc-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700/50 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <div className="mt-6 flex items-end gap-2 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={`${stat.label}-${range}`}
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                      >
                        {stat.value.toLocaleString("en-US")}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[34px]"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${stat.color} 18%, white)`,
                    color: stat.color,
                  }}
                >
                  <Icon size={54} strokeWidth={1.9} />
                </div>
              </div>

              <div className="mt-10 flex items-center gap-2 overflow-hidden text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <ArrowUpRight size={18} className="text-emerald-500" />
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
