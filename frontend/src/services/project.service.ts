import api from "@/lib/axios";

export interface FileAttachment {
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "review" | "completed" | "cancelled";
  progress: number;
  startDate: string;
  dueDate: string;
  assignedBy: string;
  createdBy: string;
  updatedBy: string;
  completedBy: string;
  estimatedHours: number;
  actualHours: number;
  attachments: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectPayload = {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  progress?: number;
  startDate?: string;
  dueDate?: string;
  assignedBy?: string;
  createdBy: string;
  estimatedHours?: number;
  actualHours?: number;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

const projectService = {
  getAll: (
    params?: {
      page?: number
      limit?: number
      q?: string
      status?: string
      priority?: string
      mine?: boolean
    }
  ) => api.get<{ data: Project[] }>("/projects", { params }),

  getMyProjects: () => api.get<{ data: Project[] }>("/projects/me"),

  getByCreatedBy: (userId: string) =>
    api.get<{ data: Project[] }>(`/projects/created-by/${userId}`),

  getById: (id: string) => api.get<{ data: Project }>(`/projects/${id}`),

  getEmployees: (id: string) =>
    api.get<{ data: unknown[] }>(`/projects/${id}/employees`),

  getByStatus: (status: string) =>
    api.get<{ data: Project[] }>(`/projects/status/${status}`),

  getByPriority: (priority: string) =>
    api.get<{ data: Project[] }>(`/projects/priority/${priority}`),

  create: (data: CreateProjectPayload) =>
    api.post<{ data: Project }>("/projects", data),

  update: (id: string, data: UpdateProjectPayload) =>
    api.patch<{ data: Project }>(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),
};

export default projectService;
