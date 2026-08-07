import { useEffect, useMemo, useState } from "react";
import { Bell, Pin, Pencil, Trash2, Send } from "lucide-react";
import type { User } from "@/services/user.service";
import type { ProjectEmployee } from "@/services/project-employee.service";
import projectNotificationService, { type ProjectNotification } from "@/services/project-notification.service";
import { MySwal } from "@/lib/swal";

interface ProjectNotificationsSectionProps {
  projectId: string;
  projectEmployees: Array<ProjectEmployee & { user?: User }>;
  currentUserId?: string;
}

const typeLabels: Record<ProjectNotification["type"], string> = {
  announcement: "Thong bao",
  reminder: "Nhac nho",
  update: "Cap nhat",
};

const priorityClass: Record<ProjectNotification["priority"], string> = {
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function ProjectNotificationsSection({
  projectId,
  projectEmployees,
  currentUserId,
}: ProjectNotificationsSectionProps) {
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ProjectNotification["type"]>("announcement");
  const [priority, setPriority] = useState<ProjectNotification["priority"]>("medium");
  const [isPinned, setIsPinned] = useState(false);

  const canManage = useMemo(() => {
    if (!currentUserId) return false;
    return projectEmployees.some((member) => member.userId === currentUserId && member.role === "leader");
  }, [currentUserId, projectEmployees]);

  const memberById = useMemo(() => {
    return new Map(projectEmployees.map((member) => [member.userId, member.user]));
  }, [projectEmployees]);

  const loadNotifications = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await projectNotificationService.getByProject(projectId);
      setNotifications(res.data.data);
    } catch {
      await MySwal.fire({ icon: "error", title: "Khong tai duoc thong bao", text: "Vui long thu lai sau." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [projectId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setType("announcement");
    setPriority("medium");
    setIsPinned(false);
  };

  const submitForm = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) {
      await MySwal.fire({ icon: "warning", title: "Thiáº¿u dá»¯ liá»‡u", text: "Vui lÃ²ng nháº­p tiÃªu Ä‘á» vÃ  ná»™i dung." });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await projectNotificationService.update(editingId, {
          title: cleanTitle,
          content: cleanContent,
          type,
          priority,
          isPinned,
        });
        await MySwal.fire({ icon: "success", title: "ThÃ nh cÃ´ng", text: "Cap nhat thong bao thanh cong", confirmButtonText: "ÄÃ³ng", confirmButtonColor: "var(--primary)" });
      } else {
        await projectNotificationService.create({
          projectId,
          title: cleanTitle,
          content: cleanContent,
          type,
          priority,
          isPinned,
        });
        await MySwal.fire({ icon: "success", title: "ThÃ nh cÃ´ng", text: "Tao thong bao thanh cong", confirmButtonText: "ÄÃ³ng", confirmButtonColor: "var(--primary)" });
      }
      resetForm();
      await loadNotifications();
    } catch (error: any) {
      await MySwal.fire({
        icon: "error",
        title: "Khong the luu thong bao",
        text: error?.response?.data?.message || "Vui long thu lai sau.",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (notification: ProjectNotification) => {
    setEditingId(notification.id);
    setTitle(notification.title);
    setContent(notification.content);
    setType(notification.type);
    setPriority(notification.priority);
    setIsPinned(notification.isPinned);
  };

  const handleDelete = async (notification: ProjectNotification) => {
    const confirmed = (await MySwal.fire({
      title: "XÃ¡c nháº­n xoÃ¡",
      icon: "warning",
      html: `Báº¡n cÃ³ cháº¯c muá»‘n xoÃ¡ thÃ´ng bÃ¡o <strong>${notification.title}</strong>?`,
      showCancelButton: true,
      confirmButtonText: "XoÃ¡",
      cancelButtonText: "Huá»·",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    })).isConfirmed;
    if (!confirmed) return;
    try {
      await projectNotificationService.delete(notification.id);
      await MySwal.fire({ icon: "success", title: "ThÃ nh cÃ´ng", text: "Xoa thong bao thanh cong", confirmButtonText: "ÄÃ³ng", confirmButtonColor: "var(--primary)" });
      await loadNotifications();
    } catch (error: any) {
      await MySwal.fire({
        icon: "error",
        title: "Khong the xoa thong bao",
        text: error?.response?.data?.message || "Vui long thu lai sau.",
      });
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <Bell size={16} className="text-blue-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thong bao du an</h2>
        <span className="ml-auto text-xs text-zinc-400">{notifications.length} thong bao</span>
      </div>

      {canManage && (
        <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Tieu de</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Nhap tieu de thong bao"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Noi dung</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Thong bao chung cho toan bo thanh vien du an"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Loai</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectNotification["type"])}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="announcement">Thong bao</option>
                <option value="reminder">Nhac nho</option>
                <option value="update">Cap nhat</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Muc do</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectNotification["priority"])}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="low">Thap</option>
                <option value="medium">Trung binh</option>
                <option value="high">Cao</option>
                <option value="critical">Khan cap</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Ghim thong bao
            </label>

            <div className="flex items-center justify-end gap-2 md:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Huy
                </button>
              )}
              <button
                type="button"
                onClick={submitForm}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={14} />
                {editingId ? "Cap nhat" : "Gui thong bao"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[26rem] space-y-3 overflow-y-auto px-5 py-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-zinc-400">Dang tai thong bao...</p>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-zinc-400">
            <Bell size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Chua co thong bao nao</p>
            <p className="mt-1 text-xs">Trưởng bộ phận có thể gửi thông báo chung cho toàn bộ thành viên dự án</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border px-4 py-3 shadow-sm ${
                notification.isPinned
                  ? "border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                  <Bell size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{notification.title}</h3>
                    {notification.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <Pin size={10} />
                        Ghim
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityClass[notification.priority]}`}>
                      {notification.priority}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {typeLabels[notification.type]}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">{notification.content}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                    <span>
                      Táº¡o bá»Ÿi: <strong className="text-zinc-600 dark:text-zinc-200">{memberById.get(notification.createdBy)?.name || "Trưởng bộ phận"}</strong>
                    </span>
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                </div>

                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(notification)}
                      className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(notification)}
                      className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




