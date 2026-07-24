import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-4">
      <h1
        className="text-[80px] font-bold leading-none m-0"
        style={{ color: "#d9d9d9" }}
      >
        404
      </h1>
      <h2 className="text-xl font-semibold m-0 text-zinc-900 dark:text-zinc-100">
        Page not found
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 m-0">
        The page you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
      >
        Back to Home
      </button>
    </div>
  )
}
