import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import Swal from "sweetalert2"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import heroImg from "@/assets/hero.png"
import { useAuth } from "@/contexts/AuthContext"
import userService from "@/services/user.service"

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  employeeCode: z.string().trim().min(1, "Vui lòng nhập mã người dùng"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { user, ready } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      employeeCode: "",
    },
  })

  useEffect(() => {
    if (!ready || !user) return
    navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true })
  }, [navigate, ready, user])

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const { data } = await userService.forgotPassword(values)
      const devCode = data.data?.devCode

      await Swal.fire({
        icon: "success",
        title: "Đã gửi yêu cầu",
        text: devCode
          ? `Mã đặt lại mật khẩu trong môi trường dev: ${devCode}`
          : "Vui lòng kiểm tra email để đặt lại mật khẩu",
        confirmButtonColor: "#2563eb",
      })

      navigate("/login", { replace: true })
    } catch {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể gửi yêu cầu đặt lại mật khẩu",
        confirmButtonColor: "#2563eb",
      })
    }
  }

  const onInvalid = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0]?.message
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: firstError || "Vui lòng kiểm tra lại thông tin",
      confirmButtonColor: "#2563eb",
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Hero image (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-white overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Hệ Thống Quản Lý Phòng Ban & Dự Án"
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
              Nhập email và mã người dùng để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6">
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  aria-invalid={Boolean(errors.email)}
                  className={`block w-full rounded-lg border bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    errors.email
                      ? "border-red-400 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  }`}
                  {...register("email")}
                />
                {errors.email?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mã người dùng
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã người dùng"
                  aria-invalid={Boolean(errors.employeeCode)}
                  className={`block w-full rounded-lg border bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    errors.employeeCode
                      ? "border-red-400 focus:ring-red-500"
                      : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  }`}
                  {...register("employeeCode")}
                />
                {errors.employeeCode?.message && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.employeeCode.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg text-white font-medium text-base border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
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
