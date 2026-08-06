import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Monitor, Moon, SunMedium } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { resolveThemeMode, type ThemeMode, useThemeStore } from "@/stores/theme"

const themeOptions: Array<{
  value: ThemeMode
  label: string
  icon: typeof SunMedium
}> = [
  { value: "system", label: "Hệ thống", icon: Monitor },
  { value: "light", label: "Sáng", icon: SunMedium },
  { value: "dark", label: "Tối", icon: Moon },
]

export default function ThemeToggle() {
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const themeMode = useThemeStore((state) => state.themeMode)
  const setThemeMode = useThemeStore((state) => state.setThemeMode)
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
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
    <div ref={menuRef} className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-sm"
        aria-label="Chọn giao diện"
        title={`Giao diện hiện tại: ${activeOption.label}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ opacity: 0, rotate: -25, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 25, scale: 0.8 }}
            transition={{ duration: 0.16 }}
            className="flex items-center"
          >
            <ActiveIcon size={18} />
          </motion.div>
        </AnimatePresence>
        <ChevronDown size={14} className="text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-2xl border border-border bg-background p-1 shadow-xl shadow-black/10"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon
              const selected = option.value === themeMode

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setThemeMode(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{option.label}</span>
                  {selected ? <Check size={14} className="text-primary" /> : null}
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
