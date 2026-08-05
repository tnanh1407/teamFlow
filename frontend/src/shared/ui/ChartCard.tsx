import type { ReactNode } from "react"
import { motion } from "motion/react"

interface ChartCardProps {
  title: string
  subtitle?: string
  rightContent?: ReactNode
  children: ReactNode
  delay?: number
}

export default function ChartCard({
  title,
  subtitle,
  rightContent,
  children,
  delay = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div className="min-w-0">
          <h2 className="text-base font-semibold uppercase text-zinc-900 dark:text-zinc-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
      </div>

      <div className="p-5">{children}</div>
    </motion.div>
  )
}
