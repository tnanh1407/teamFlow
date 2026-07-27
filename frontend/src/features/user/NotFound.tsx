import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-4 bg-white dark:bg-zinc-900">
      <h1 className="text-[120px] font-bold leading-none text-blue-600">
        404
      </h1>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Trang không tồn tại
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm text-center">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <button
        onClick={() => navigate("/")}
        className="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
      >
        Về trang chủ
      </button>
    </div>
  )
}
