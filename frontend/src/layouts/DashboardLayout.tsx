import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/layout/Sidebar";
import {useHotkeys} from "react-hotkeys-hook";
import Header from "@/layout/Header";


export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useHotkeys("ctrl+b" , (e) => {
    e.preventDefault()
    setCollapsed(c => !c)
  })

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
