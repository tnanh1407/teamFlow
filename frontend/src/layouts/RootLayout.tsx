import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            TeamFlow
          </Link>
          <ul className="flex gap-4">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                  Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © 2026 TeamFlow
      </footer>
    </div>
  );
}
