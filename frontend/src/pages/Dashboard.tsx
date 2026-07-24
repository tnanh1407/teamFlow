import { useAuth } from "@/contexts/AuthContext";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              <strong>{user.username}</strong> • <span className="uppercase text-xs bg-zinc-900/10 dark:bg-zinc-100/10 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded-full">{user.role}</span>
            </span>
            <button onClick={handleLogout} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Đăng xuất
            </button>
          </div>
        )}
      </div>
      <p className="text-zinc-500 dark:text-zinc-400">Welcome to your dashboard.</p>
    </div>
  );
}
