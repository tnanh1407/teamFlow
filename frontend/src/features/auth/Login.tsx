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
import AuthPageSkeleton from "@/shared/ui/AuthPageSkeleton"
import PageSeo, { type PageSeoProps } from "@/shared/ui/PageSeo"

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
  const pageSeo: PageSeoProps = {
    title: "Đăng nhập",
    description: "Đăng nhập vào hệ thống quản lý phòng ban và dự án",
  }
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

  if (!ready) return <AuthPageSkeleton />

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
      const status = error && typeof error === "object" && "response" in error ? (error as { response?: { status?: number } }).response?.status : undefined
      const message =
        status === 403
          ? "Tài khoản đã nghỉ việc hoặc bị khóa"
          : status === 401
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
    <div className="flex min-h-screen bg-background text-foreground">
      <PageSeo {...pageSeo} />
      {/* Left: Hero image (desktop only) */}
      <div className="hidden flex-1 overflow-hidden border-r border-border bg-muted/30 lg:flex">
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
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-[440px]">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-lg shadow-primary/20 lg:hidden">
              TF
            </div>
            <h1 className="mb-1 mt-2 text-2xl font-bold text-foreground">
              Đăng nhập
            </h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để tiếp tục quản lý
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  aria-invalid={Boolean(errors.username)}
                  className={`block w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition ${
                    errors.username
                      ? "border-red-400 focus:ring-red-500"
                      : "border-border"
                  }`}
                  {...register("username")}
                />
                {errors.username?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    aria-invalid={Boolean(errors.password)}
                    className={`block w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.password
                        ? "border-red-400 focus:ring-red-500"
                        : "border-border"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 -mt-1">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberInfo}
                    onChange={(e) => setRememberInfo(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Lưu thông tin</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="cursor-pointer border-none bg-transparent text-xs text-primary hover:text-primary/80"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full cursor-pointer rounded-lg border-none bg-primary text-base font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
