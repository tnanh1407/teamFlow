import { useNavigate } from "react-router-dom"
import { useAuth } from "@/stores/auth"

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    }
  }

  const handleHome = () => {
    if (!user) return
    navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true })
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-white"
      style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,141,255,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,135,67,0.08),_transparent_28%)]" />
      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-10">
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-semibold tracking-wide text-[#5A8DFF] dark:border-blue-950 dark:bg-blue-950/60 dark:text-blue-300">
              TeamFlow
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Trang lỗi
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <span className="text-[clamp(96px,18vw,170px)] font-black leading-none tracking-[-0.08em] bg-[linear-gradient(135deg,#5A8DFF_0%,#7FA6FF_45%,#FF8743_100%)] bg-clip-text text-transparent">
                404
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-white sm:text-3xl">
              Trang không tồn tại
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              Đường dẫn bạn truy cập không hợp lệ, đã bị xoá hoặc không còn tồn tại trong hệ thống.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Quay lại
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={handleHome}
                  className="rounded-full bg-[#5A8DFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4b7cff] cursor-pointer"
                >
                  {user.role === "admin" ? "Về dashboard" : "Về trang của tôi"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
