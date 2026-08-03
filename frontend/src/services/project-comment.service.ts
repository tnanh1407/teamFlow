import api from "@/lib/axios";

export interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  attachments: string;
  createdAt: string;
  updatedAt: string;
}

const mapComment = (comment: { id: string; projectId: string; employeeId: string; content: string; attachments: string; createdAt: string; updatedAt: string }): ProjectComment => ({
  id: comment.id,
  projectId: comment.projectId,
  userId: comment.employeeId,
  content: comment.content,
  attachments: comment.attachments,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const projectCommentService = {
  getAll: async () => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; content: string; attachments: string; createdAt: string; updatedAt: string }> }>("/project-comments");
    return { data: { data: data.data.map(mapComment) } };
  },

  getByProject: async (projectId: string) => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; content: string; attachments: string; createdAt: string; updatedAt: string }> }>(`/project-comments/project/${projectId}`);
    return { data: { data: data.data.map(mapComment) } };
  },

  getByUser: (userId: string) =>
    api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; content: string; attachments: string; createdAt: string; updatedAt: string }> }>(`/project-comments/employee/${userId}`),

  getById: async (id: string) => {
    const { data } = await api.get<{ data: { id: string; projectId: string; employeeId: string; content: string; attachments: string; createdAt: string; updatedAt: string } }>(`/project-comments/${id}`);
    return { data: { data: mapComment(data.data) } };
  },

  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post<{ data: unknown[] }>("/project-comments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  create: (data: { projectId: string; userId: string; content?: string; attachments?: string }) =>
    api.post("/project-comments", { ...data, employeeId: data.userId }),

  update: (id: string, data: Partial<Pick<ProjectComment, "content" | "attachments">>) =>
    api.patch<{ data: ProjectComment }>(`/project-comments/${id}`, data),

  delete: (id: string) => api.delete(`/project-comments/${id}`),
};

export default projectCommentService;
