import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/layout/Sidebar"
import { useHotkeys } from "react-hotkeys-hook"
import Header from "@/layout/Header"
import CommandPalette from "@/features/search/CommandPalette"
import { useAuthStore } from "@/stores/auth"

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const ready = useAuthStore((state) => state.ready)
  const canUseQuickSearch = ready && (user?.role === "admin" || user?.position === "leader")
  useHotkeys("ctrl+b", (e) => {
    e.preventDefault()
    setCollapsed(c => !c)
  })
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault()
    if (canUseQuickSearch) {
      setPaletteOpen(true)
    }
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} loading={!ready} />
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <Header
          collapsed={collapsed}
          loading={!ready}
          quickSearchEnabled={canUseQuickSearch}
          onToggle={() => setCollapsed(!collapsed)}
          onQuickSearchClick={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette
        open={paletteOpen}
        enabled={canUseQuickSearch}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  )
}
