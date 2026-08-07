import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import Swal from "sweetalert2"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import heroImg from "@/assets/hero.png"
import { useAuth } from "@/stores/auth"
import AuthPageSkeleton from "@/shared/ui/AuthPageSkeleton"
import PageSeo, { type PageSeoProps } from "@/shared/ui/PageSeo"
import SystemLogo from "@/shared/ui/SystemLogo"
import { useActiveDepartmentsQuery, useForgotPasswordMutation } from "../mutations/user.mutations"

const forgotPasswordSchema = z.object({
  departmentId: z.string().min(1, "Vui lòng chọn phòng ban"),
  employeeCode: z.string().trim().min(1, "Vui lòng nhập mã người dùng"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

function getErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) return "Không thể gửi yêu cầu cấp lại mật khẩu"
  const response = Reflect.get(error, "response")
  const data = typeof response === "object" && response !== null ? Reflect.get(response, "data") : null
  const message = typeof data === "object" && data !== null ? Reflect.get(data, "message") : null
  return typeof message === "string" && message.trim()
    ? message
    : "Không thể gửi yêu cầu cấp lại mật khẩu"
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { user, ready } = useAuth()
  const forgotPasswordMutation = useForgotPasswordMutation({
    onSuccess: async () => {
      await Swal.fire({
        icon: "success",
        title: "Cảm ơn bạn",
        text: "Yêu cầu của bạn đã được tiếp nhận. Vui lòng chờ trong 24 giờ để Admin xử lý và kiểm tra hộp thư.",
        confirmButtonColor: "var(--primary)",
      })

      navigate("/login", { replace: true })
    },
    onError: (error: unknown) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: getErrorMessage(error),
        confirmButtonColor: "var(--primary)",
      })
    },
  })
  const departmentsQuery = useActiveDepartmentsQuery()
  const pageSeo: PageSeoProps = {
    title: "Quên mật khẩu",
    description: "Khôi phục mật khẩu cho hệ thống quản lý phòng ban và dự án",
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      departmentId: "",
      employeeCode: "",
    },
  })
  const departmentId = watch("departmentId")

  useEffect(() => {
    if (!ready || !user) return
    navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true })
  }, [navigate, ready, user])

  if (!ready) return <AuthPageSkeleton />

  const onInvalid = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0]?.message
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: firstError || "Vui lòng kiểm tra lại thông tin",
      confirmButtonColor: "var(--primary)",
    })
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

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-110">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <SystemLogo className="mb-4 h-14 w-14 drop-shadow-sm lg:hidden" />
            <h1 className="mb-1 mt-2 text-3xl font-bold text-foreground capitalize">
              Quên mật khẩu
            </h1>
            <p className="text-sm text-foreground">
              Nhập thông tin để gửi yêu cầu cấp lại mật khẩu
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <form
              onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values), onInvalid)}
              className="space-y-5"
              noValidate
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Phòng ban
                </label>
                <select
                  {...register("departmentId")}
                  aria-invalid={Boolean(errors.departmentId)}
                  className={`block w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.departmentId ? "border-destructive focus:ring-destructive" : "border-border"}`}
                >
                  <option value="">
                    {departmentsQuery.isLoading ? "Đang tải phòng ban..." : "-- Chọn phòng ban --"}
                  </option>
                  {departmentsQuery.data?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <p className="-mt-2 text-xs text-muted-foreground">
                Chọn phòng ban trước khi nhập mã người dùng. Email sẽ được lấy từ hồ sơ nhân viên.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mã người dùng
                </label>
                <input
                  type="text"
                  disabled={!departmentId}
                  placeholder="Nhập mã người dùng"
                  aria-invalid={Boolean(errors.employeeCode)}
                  className={`block w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.employeeCode
                    ? "border-destructive focus:ring-destructive"
                    : "border-border"
                    }`}
                  {...register("employeeCode")}
                />
                {errors.employeeCode?.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.employeeCode.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="h-11 w-full cursor-pointer rounded-lg border-none bg-primary text-base font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {forgotPasswordMutation.isPending ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="cursor-pointer border-none bg-transparent text-sm text-primary hover:text-primary/80"
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
