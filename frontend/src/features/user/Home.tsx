import { useAuth } from "@/contexts/AuthContext";

import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to TeamFlow</h1>
      <p className="text-lg text-zinc-500 dark:text-zinc-400">
        Your team collaboration platform.
      </p>
      {user && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.avatarURL ? (
              <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{user.username.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Xin chào, <strong>{user.username}</strong>
          </span>
          <button onClick={handleLogout} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
