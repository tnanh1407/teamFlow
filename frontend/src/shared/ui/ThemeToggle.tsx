import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Monitor, Moon, SunMedium } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { resolveThemeMode, type ThemeMode, useThemeStore } from "@/stores/theme"

const themeOptions: Array<{ value: ThemeMode; label: string; icon: typeof SunMedium }> = [
  { value: "system", label: "Hệ thống", icon: Monitor },
  { value: "light", label: "Sáng", icon: SunMedium },
  { value: "dark", label: "Tối", icon: Moon },
]

export default function ThemeToggle() {
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const themeMode = useThemeStore((state) => state.themeMode)
  const setThemeMode = useThemeStore((state) => state.setThemeMode)
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const resolvedTheme = resolveThemeMode(themeMode, systemPrefersDark)
  const activeOption = useMemo(() => themeOptions.find((option) => option.value === themeMode) ?? themeOptions[0], [themeMode])
  const ActiveIcon = activeOption.icon

  return (
    <div ref={menuRef} className="relative shrink-0">
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="Chọn giao diện"
        title={`Giao diện hiện tại: ${activeOption.label}`}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={resolvedTheme} initial={{ opacity: 0, rotate: -20, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 20, scale: 0.8 }} transition={{ duration: 0.15 }} className="flex">
            <ActiveIcon size={17} />
          </motion.span>
        </AnimatePresence>
        <ChevronDown size={14} />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.16 }} className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xl">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const selected = option.value === themeMode
              return (
                <button key={option.value} type="button" onClick={() => { setThemeMode(option.value); setOpen(false) }} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${selected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon size={16} />
                  <span className="flex-1">{option.label}</span>
                  {selected ? <Check size={14} /> : null}
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
