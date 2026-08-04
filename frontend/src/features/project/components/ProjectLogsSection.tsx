import type { ProjectLog } from "@/services/project-log.service"
import type { User } from "@/services/user.service"

const actionLabels: Record<string, string> = {
  created: "Tạo dự án",
  updated: "Cập nhật thông tin",
  assigned: "Phân công nhân sự",
  removed: "Xoá khỏi dự án",
  status_changed: "Thay đổi trạng thái",
  commented: "Bình luận",
}

interface ProjectLogsProps {
  logs: ProjectLog[]
  logUserMap: Record<string, User>
  onSelectLog: (log: ProjectLog) => void
}

export default function ProjectLogsSection({ logs, logUserMap, onSelectLog }: ProjectLogsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lịch sử hoạt động</h2>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có hoạt động nào</p>
        ) : (
          logs.map((log) => {
            const emp = logUserMap[log.userId]
            const actorName = emp?.name ? `${emp.name} (${emp.employeeCode || "—"})` : "—"
            return (
              <button
                key={log.id}
                onClick={() => onSelectLog(log)}
                className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer border-none border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                  {emp?.avatarURL ? (
                    <img src={emp.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{emp?.name?.slice(0, 2).toUpperCase() || "??"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    <span className="font-medium">{actorName}</span>
                    <span className="text-zinc-400 mx-1">·</span>
                    <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                    {log.description && <span className="text-zinc-500"> — {log.description}</span>}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(log.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
