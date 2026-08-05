import api from "@/lib/axios";

export interface ProjectNotification {
  id: string;
  projectId: string;
  createdBy: string;
  title: string;
  content: string;
  type: "announcement" | "reminder" | "update";
  priority: "low" | "medium" | "high" | "critical";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

type BackendNotification = {
  id: string;
  projectId: string;
  createdBy: string;
  title: string;
  content: string;
  type: "announcement" | "reminder" | "update";
  priority: "low" | "medium" | "high" | "critical";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

const mapNotification = (notification: BackendNotification): ProjectNotification => ({
  id: notification.id,
  projectId: notification.projectId,
  createdBy: notification.createdBy,
  title: notification.title,
  content: notification.content,
  type: notification.type,
  priority: notification.priority,
  isPinned: notification.isPinned,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const projectNotificationService = {
  getByProject: async (projectId: string) => {
    const { data } = await api.get<{ data: BackendNotification[] }>(`/project-notifications/project/${projectId}`);
    return { data: { data: data.data.map(mapNotification) } };
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ data: BackendNotification }>(`/project-notifications/${id}`);
    return { data: { data: mapNotification(data.data) } };
  },

  create: (data: {
    projectId: string;
    title: string;
    content: string;
    type?: ProjectNotification["type"];
    priority?: ProjectNotification["priority"];
    isPinned?: boolean;
  }) => api.post<{ data: BackendNotification }>("/project-notifications", data),

  update: (id: string, data: Partial<Pick<ProjectNotification, "title" | "content" | "type" | "priority" | "isPinned">>) =>
    api.patch<{ data: BackendNotification }>(`/project-notifications/${id}`, data),

  delete: (id: string) => api.delete(`/project-notifications/${id}`),
};

export default projectNotificationService;
