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
      className="rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-foreground sm:text-base">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {rightContent ? <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">{rightContent}</div> : null}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </motion.div>
  )
}
