import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/layout/Sidebar"
import { useHotkeys } from "react-hotkeys-hook"
import Header from "@/layout/Header"
import CommandPalette from "@/features/search/CommandPalette"

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  useHotkeys("ctrl+b", (e) => {
    e.preventDefault()
    setCollapsed(c => !c)
  })
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault()
    setPaletteOpen(true)
  })

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onQuickSearchClick={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
