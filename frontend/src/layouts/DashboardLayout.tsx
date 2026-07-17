import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-3">
          <h1 className="text-lg font-semibold">TeamFlow</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
