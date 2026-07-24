import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { User, Shield, Calendar, KeyRound, Save } from "lucide-react"

export default function Settings() {
  const { user } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "TF"

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Cài đặt
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {user?.username}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Shield size={13} />
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className={labelClass}>Mã nhân viên</label>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-1.5">
                <User size={14} className="text-zinc-400" />
                {user?.employeeId || "—"}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tên đăng nhập</label>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-1.5">
                <User size={14} className="text-zinc-400" />
                {user?.username}
              </div>
            </div>
            <div>
              <label className={labelClass}>Vai trò</label>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-1.5">
                <Shield size={14} className="text-zinc-400" />
                {user?.role === "admin" ? "Admin" : "User"}
              </div>
            </div>
            <div>
              <label className={labelClass}>Ngày tạo</label>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-1.5">
                <Calendar size={14} className="text-zinc-400" />
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={18} className="text-zinc-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Đổi mật khẩu
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer border-none">
              <Save size={15} />
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
