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

      <footer className="border-t">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="text-lg font-semibold tracking-tight">
                TeamFlow
              </Link>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Streamline collaboration, manage projects, and ship faster — all in one place.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link to="/features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</Link></li>
                <li><Link to="/changelog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <p>© 2026 TeamFlow. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
