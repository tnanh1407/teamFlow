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
  getByProject: (projectId: string) =>
    api.get<{ data: ProjectComment[] }>(`/project-comments/project/${projectId}`),

  create: (data: { projectId: string; employeeId: string; content?: string; attachments?: string }) =>
    api.post<{ data: ProjectComment }>("/project-comments", data),

  delete: (id: string) => api.delete(`/project-comments/${id}`),
};

export default projectCommentService;
