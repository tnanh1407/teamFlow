import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Eye, EyeOff } from "lucide-react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import heroImg from "@/assets/hero.png"
import accountService from "@/services/account.service"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Vui lòng nhập đầy đủ tài khoản và mật khẩu", confirmButtonColor: "#2563eb" })
      return
    }
    setLoading(true)
    try {
      const { data } = await accountService.login({ username, password })
      const user = data.data.account
      setUser(user)
      toast.success(`Xin chào ${user.username}!`)
      const home: Record<string, string> = {
        admin: "/dashboard",
      }
      navigate(home[user.position] || "/")
    } catch {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Sai tài khoản hoặc mật khẩu", confirmButtonColor: "#2563eb" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero image (desktop only) */}
      <div
        className="hidden lg:flex flex-1 bg-white overflow-hidden"
      >
        <motion.img
          src={heroImg}
          alt="TeamFlow"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-110">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">

            <h1 className="text-2xl font-bold mt-6 mb-1 text-zinc-900 dark:text-zinc-100">
              Đăng nhập
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Đăng nhập để tiếp tục quản lý
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tài khoản
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer bg-transparent border-none p-0"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer bg-transparent border-none"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg text-white font-medium text-base border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{
                  background: "#2563eb",
                }}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
