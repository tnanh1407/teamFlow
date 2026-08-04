import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

interface Stat {
  label: string
  value: number
  color: string
}

interface StatsGridProps {
  stats: Stat[]
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Tổng quan hệ thống</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Thống kê toàn bộ phân hệ</h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Số liệu ngắn gọn, đủ để nhìn nhanh tình trạng vận hành
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="group rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-900/60"
            >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  <ArrowUpRight size={14} className="text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                </div>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{ width: "100%", backgroundColor: stat.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
