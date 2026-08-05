import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Stat {
  label: string
  value: number
  color: string
  icon: LucideIcon
}

interface StatsGridProps {
  stats: Stat[]
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="rounded-[32px] border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Thống kê toàn bộ phân hệ</h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Số liệu ngắn gọn, đủ để nhìn nhanh tình trạng vận hành
        </p>
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
                  <div className="mt-6 flex items-end gap-2">
                    <p className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {stat.value.toLocaleString("en-US")}
                    </p>
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

              <div className="mt-10 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <ArrowUpRight size={18} className="text-emerald-500" />
                <span>Số liệu hiện tại</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
