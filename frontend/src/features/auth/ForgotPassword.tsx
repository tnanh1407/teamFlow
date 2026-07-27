import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import heroImg from "@/assets/hero.png"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Vui lòng nhập email")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ")
      return
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      // TODO: call forgot password API
      console.log("Forgot password email:", email)
      setSuccess("Vui lòng kiểm tra email để đặt lại mật khẩu")
      setTimeout(() => navigate("/login"), 2000)
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại sau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero image (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-white overflow-hidden">
        <motion.img
          src={heroImg}
          alt="TeamFlow"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-[440px]">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="lg:hidden flex items-center justify-center w-12 h-12 rounded-xl font-extrabold text-lg text-white"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            >
              TF
            </div>
            <h1 className="text-2xl font-bold mt-6 mb-1 text-zinc-900 dark:text-zinc-100">
              Quên mật khẩu
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg text-white font-medium text-base border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                }}
              >
                {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent border-none cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
