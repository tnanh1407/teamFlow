import api from "@/lib/axios";

export interface ProjectComment {
  id: string;
  projectId: string;
  employeeId: string;
  content: string;
  attachments: string;
  createdAt: string;
  updatedAt: string;
}

const projectCommentService = {
  getAll: () => api.get<{ data: ProjectComment[] }>("/project-comments"),

  getByProject: (projectId: string) =>
    api.get<{ data: ProjectComment[] }>(`/project-comments/project/${projectId}`),

  getByEmployee: (employeeId: string) =>
    api.get<{ data: ProjectComment[] }>(`/project-comments/employee/${employeeId}`),

  getById: (id: string) =>
    api.get<{ data: ProjectComment }>(`/project-comments/${id}`),

  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post<{ data: unknown[] }>("/project-comments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  create: (data: { projectId: string; employeeId: string; content?: string; attachments?: string }) =>
    api.post<{ data: ProjectComment }>("/project-comments", data),

  update: (id: string, data: Partial<Pick<ProjectComment, "content" | "attachments">>) =>
    api.patch<{ data: ProjectComment }>(`/project-comments/${id}`, data),

  delete: (id: string) => api.delete(`/project-comments/${id}`),
};

export default projectCommentService;
