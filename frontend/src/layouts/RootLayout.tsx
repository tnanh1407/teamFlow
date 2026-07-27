import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <nav className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-[10px] font-bold text-white dark:text-zinc-900">
              TF
            </span>
            TeamFlow
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
