import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  index: number
}

export default function StatCard({ label, value, icon: Icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 h-[200px]"
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
            <ArrowUpRight size={14} className="text-emerald-500" />
          </div>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}
