import api from "@/lib/axios"

export interface SystemNotification {
  id: string
  createdBy: string | null
  source: "admin" | "system"
  title: string
  content: string
  type: "announcement" | "reminder" | "update"
  priority: "low" | "medium" | "high" | "critical"
  targetAudience: "all" | "user" | "manager" | "staff" | "intern" | "admin"
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

type BackendNotification = {
  id: string
  createdBy: string | null
  source: "admin" | "system"
  title: string
  content: string
  type: "announcement" | "reminder" | "update"
  priority: "low" | "medium" | "high" | "critical"
  targetAudience: "all" | "user" | "manager" | "staff" | "intern" | "admin"
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

const mapNotification = (notification: BackendNotification): SystemNotification => ({
  id: notification.id,
  createdBy: notification.createdBy,
  source: notification.source,
  title: notification.title,
  content: notification.content,
  type: notification.type,
  priority: notification.priority,
  targetAudience: notification.targetAudience,
  isPinned: notification.isPinned,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
})

const systemNotificationService = {
  getVisible: async () => {
    const { data } = await api.get<{ data: BackendNotification[] }>("/system-notifications")
    return { data: { data: data.data.map(mapNotification) } }
  },

  getAll: async () => {
    const { data } = await api.get<{ data: BackendNotification[] }>("/system-notifications/manage")
    return { data: { data: data.data.map(mapNotification) } }
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ data: BackendNotification }>(`/system-notifications/${id}`)
    return { data: { data: mapNotification(data.data) } }
  },

  create: (data: {
    title: string
    content: string
    type?: SystemNotification["type"]
    priority?: SystemNotification["priority"]
    targetAudience?: SystemNotification["targetAudience"]
    isPinned?: boolean
  }) => api.post<{ data: BackendNotification }>("/system-notifications", data),

  update: (
    id: string,
    data: Partial<Pick<SystemNotification, "title" | "content" | "type" | "priority" | "targetAudience" | "isPinned">>
  ) => api.patch<{ data: BackendNotification }>(`/system-notifications/${id}`, data),

  delete: (id: string) => api.delete(`/system-notifications/${id}`),
}

export default systemNotificationService

