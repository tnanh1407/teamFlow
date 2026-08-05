import { useEffect, useState, type FormEvent } from "react"
import { Edit2, Pin, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import systemNotificationService, { type SystemNotification } from "@/services/system-notification.service"
import { showDeleteConfirm, showSuccessToast } from "@/lib/swal"

type Mode = "view" | "manage"

interface SystemNotificationsSectionProps {
  mode?: Mode
}

const defaultForm = {
  title: "",
  content: "",
  type: "announcement" as SystemNotification["type"],
  priority: "medium" as SystemNotification["priority"],
  targetAudience: "all" as SystemNotification["targetAudience"],
  isPinned: false,
}

const typeLabels: Record<SystemNotification["type"], string> = {
  announcement: "Thông báo",
  reminder: "Nhắc nhở",
  update: "Cập nhật",
}

const priorityLabels: Record<SystemNotification["priority"], string> = {
  low: "Thấp",
  medium: "Vừa",
  high: "Cao",
  critical: "Khẩn",
}

const audienceLabels: Record<SystemNotification["targetAudience"], string> = {
  all: "Toàn hệ thống",
  user: "Nhân sự",
  manager: "Quản lí",
  staff: "Nhân viên",
  intern: "Thực tập sinh",
  admin: "Quản trị viên",
}

const sourceLabels: Record<SystemNotification["source"], string> = {
  admin: "Admin",
  system: "System",
}

export default function SystemNotificationsSection({ mode = "view" }: SystemNotificationsSectionProps) {
  const { user } = useAuth()
  const canManage = mode === "manage" && user?.role === "admin"
  const [items, setItems] = useState<SystemNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = canManage ? await systemNotificationService.getAll() : await systemNotificationService.getVisible()
      setItems(res.data.data)
    } catch {
      setItems([])
      console.error("Failed to fetch system notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage])

  const resetForm = () => {
    setEditingId(null)
    setForm(defaultForm)
  }

  const startEdit = (notification: SystemNotification) => {
    setEditingId(notification.id)
    setForm({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      targetAudience: notification.targetAudience,
      isPinned: notification.isPinned,
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManage) return

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        priority: form.priority,
        targetAudience: form.targetAudience,
        isPinned: form.isPinned,
      }

      const hasContentChanged = editingId
        ? items.find((item) => item.id === editingId)?.title !== payload.title ||
          items.find((item) => item.id === editingId)?.content !== payload.content ||
          items.find((item) => item.id === editingId)?.type !== payload.type ||
          items.find((item) => item.id === editingId)?.priority !== payload.priority ||
          items.find((item) => item.id === editingId)?.targetAudience !== payload.targetAudience ||
          items.find((item) => item.id === editingId)?.isPinned !== payload.isPinned
        : true

      if (!hasContentChanged) {
        await showSuccessToast("Không có thay đổi nào")
        return
      }

      if (editingId) {
        await systemNotificationService.update(editingId, payload)
        await showSuccessToast("Đã cập nhật thông báo")
      } else {
        await systemNotificationService.create(payload)
        await showSuccessToast("Đã tạo thông báo")
      }

      resetForm()
      await fetchNotifications()
    } catch {
      console.error("Failed to save system notification")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (notification: SystemNotification) => {
    if (!canManage) return
    const confirmed = await showDeleteConfirm({ name: notification.title })
    if (!confirmed) return

    try {
      await systemNotificationService.delete(notification.id)
      await showSuccessToast("Đã xoá thông báo")
      if (editingId === notification.id) resetForm()
      await fetchNotifications()
    } catch {
      console.error("Failed to delete system notification")
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {canManage ? "Thông báo hệ thống" : "Thông báo từ hệ thống"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {canManage ? "Admin tạo và quản lí thông báo cho toàn hệ thống." : "Thông báo phù hợp với vai trò của bạn."}
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Plus size={14} />
            Thông báo mới
          </button>
        )}
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Tiêu đề thông báo"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as SystemNotification["type"] }))}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="announcement">Thông báo</option>
              <option value="reminder">Nhắc nhở</option>
              <option value="update">Cập nhật</option>
            </select>
            <select
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as SystemNotification["priority"] }))}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="low">Ưu tiên thấp</option>
              <option value="medium">Ưu tiên vừa</option>
              <option value="high">Ưu tiên cao</option>
              <option value="critical">Khẩn cấp</option>
            </select>
            <select
              value={form.targetAudience}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetAudience: event.target.value as SystemNotification["targetAudience"] }))
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="all">Toàn hệ thống</option>
              <option value="user">Nhân sự</option>
              <option value="manager">Quản lí</option>
              <option value="staff">Nhân viên</option>
              <option value="intern">Thực tập sinh</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <textarea
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            placeholder="Nội dung thông báo"
            rows={4}
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(event) => setForm((prev) => ({ ...prev, isPinned: event.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Ghim thông báo
            </label>

            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Huỷ
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo thông báo"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-400">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-400">Chưa có thông báo nào</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                        <Pin size={11} />
                        Ghim
                      </span>
                    )}
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {typeLabels[item.type]}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {priorityLabels[item.priority]}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {audienceLabels[item.targetAudience]}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {sourceLabels[item.source]}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.content}</p>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <Edit2 size={13} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={13} />
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
