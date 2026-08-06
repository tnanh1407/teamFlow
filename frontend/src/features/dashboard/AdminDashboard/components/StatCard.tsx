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
      className="group relative h-[200px] overflow-hidden rounded-xl border border-border bg-background p-5 transition-all duration-200 hover:border-border hover:shadow-md"
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <ArrowUpRight size={14} className="text-success" />
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
