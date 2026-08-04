import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Eye, EyeOff } from "lucide-react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import heroImg from "@/assets/hero.png"
import userService from "@/services/user.service"
import { useAuth } from "@/contexts/AuthContext"

const loginSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { user, ready, setUser } = useAuth()
  const savedUsername = localStorage.getItem("rememberedUsername") ?? ""
  const [showPassword, setShowPassword] = useState(false)
  const [rememberInfo, setRememberInfo] = useState(Boolean(savedUsername))
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: savedUsername,
      password: "",
    },
  })

  useEffect(() => {
    if (!ready || !user) return
    navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true })
  }, [navigate, ready, user])

  const onSubmit = async (values: LoginFormValues) => {
    try {
      if (rememberInfo) {
        localStorage.setItem("rememberedUsername", values.username.trim())
      } else {
        localStorage.removeItem("rememberedUsername")
      }

      const { data } = await userService.login(values)
      const user = data.data.user
      setUser(user)
      toast.success(`Xin chào ${user.username}!`)
      navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true })
    } catch (error) {
      const message =
        error && typeof error === "object" && "response" in error
          ? "Sai tài khoản hoặc mật khẩu"
          : "Không thể đăng nhập lúc này"

      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: message,
        confirmButtonColor: "#2563eb",
      })
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
          alt="Hệ Thống Quản Lý Phòng Ban & Dự Án"
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
            <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  aria-invalid={Boolean(errors.username)}
                  className={`block w-full rounded-lg border bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    errors.username
                      ? "border-red-400 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  }`}
                  {...register("username")}
                />
                {errors.username?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    aria-invalid={Boolean(errors.password)}
                    className={`block w-full rounded-lg border bg-white dark:bg-zinc-800 px-3 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                      errors.password
                        ? "border-red-400 focus:ring-red-500"
                        : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer bg-transparent border-none p-0"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 -mt-1">
                <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberInfo}
                    onChange={(e) => setRememberInfo(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Lưu thông tin</span>
                </label>

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
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg text-white font-medium text-base border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{
                  background: "#2563eb",
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
