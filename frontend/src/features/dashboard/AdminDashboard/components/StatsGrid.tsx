import { AnimatePresence, motion } from "motion/react"
import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Stat {
  label: string
  value: number
  color: string
  icon: LucideIcon
  trendText: string
  trendPercentText: string
  trendDeltaText: string
  trendDirection: "up" | "down" | "flat"
  href: string
}

interface StatsGridProps {
  primaryStats: Stat[]
  secondaryStats: Stat[]
  rangeLabel: string
  onCardClick: (href: string) => void
}

interface StatCardProps {
  stat: Stat
  index: number
  compact?: boolean
  rangeLabel: string
  onCardClick: (href: string) => void
}

function trendToneClass(direction: Stat["trendDirection"]) {
  if (direction === "up") return "text-success"
  if (direction === "down") return "text-destructive"
  return "text-muted-foreground"
}

function StatCard({ stat, index, compact = false, rangeLabel, onCardClick }: StatCardProps) {
  const Icon = stat.icon

  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(stat.href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onCardClick(stat.href)
        }
      }}
      className={`cursor-pointer rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        compact ? "p-3 shadow-sm" : "p-4 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-medium text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>{stat.label}</p>
          <div className={`mt-2 flex items-end gap-2 overflow-hidden ${compact ? "min-h-10" : "min-h-12"}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${stat.label}-${rangeLabel}`}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`font-semibold tracking-tight text-foreground ${compact ? "text-2xl" : "text-3xl"}`}
              >
                {stat.value.toLocaleString("en-US")}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
          style={{
            backgroundColor: `color-mix(in srgb, ${stat.color} 14%, var(--background))`,
            color: stat.color,
          }}
        >
          <Icon size={compact ? 18 : 20} strokeWidth={2} />
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2 ${compact ? "text-[11px]" : "text-xs"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${stat.label}-${rangeLabel}-${stat.trendDirection}`}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-0.5 shrink-0"
          >
            {stat.trendDirection === "down" ? (
              <TrendingDown size={compact ? 14 : 16} className={trendToneClass(stat.trendDirection)} />
            ) : stat.trendDirection === "flat" ? (
              <TrendingUpDown size={compact ? 14 : 16} className={trendToneClass(stat.trendDirection)} />
            ) : (
              <TrendingUp size={compact ? 14 : 16} className={trendToneClass(stat.trendDirection)} />
            )}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            className="line-clamp-2 leading-5 text-muted-foreground"
            key={`${stat.label}-${rangeLabel}-${stat.trendText}-${stat.trendPercentText}-${stat.trendDeltaText}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {stat.trendPercentText ? <span className={`font-semibold ${trendToneClass(stat.trendDirection)}`}>{stat.trendPercentText} </span> : null}
            {stat.trendDeltaText ? <span className={`font-semibold ${trendToneClass(stat.trendDirection)}`}>{stat.trendDeltaText} </span> : null}
            {stat.trendText}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function StatsGrid({ primaryStats, secondaryStats, rangeLabel, onCardClick }: StatsGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Chỉ số tổng quan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Dữ liệu hiển thị theo bộ lọc thời gian: {rangeLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat, index) => (
          <StatCard
            key={stat.label}
            stat={stat}
            index={index}
            rangeLabel={rangeLabel}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {secondaryStats.map((stat, index) => (
          <StatCard
            key={stat.label}
            stat={stat}
            index={index}
            compact
            rangeLabel={rangeLabel}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </section>
  )
}
