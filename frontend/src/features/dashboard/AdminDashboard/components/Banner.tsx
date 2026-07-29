import { Circle } from "lucide-react"
import type { Account } from "@/services/account.service"

interface BannerProps {
  user: Account | null
}

export default function Banner({ user }: BannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-700 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 translate-x-16 -translate-y-16 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white/80 uppercase tracking-wider">
            Tổng Quan
          </div>
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <Circle size={4} fill="currentColor" />
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.avatarURL ? (
                <img src={user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{user.username.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Xin chào, {user?.username || "Admin"}
          </h1>
        </div>
        <p className="mt-1 text-sm text-blue-100/80 max-w-xl">
          Chào mừng bạn quay trở lại. Dưới đây là tổng quan về hệ thống TeamFlow của bạn.
        </p>
      </div>
    </div>
  )
}
