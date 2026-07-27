import api from "@/lib/axios";

export interface ProjectLog {
  id: string;
  projectId: string;
  employeeId: string;
  action: string;
  description: string;
  createdAt: string;
}

const projectLogService = {
  getAll: () => api.get<{ data: ProjectLog[] }>("/project-logs"),

  getByProject: (projectId: string) =>
    api.get<{ data: ProjectLog[] }>(`/project-logs/project/${projectId}`),

  getById: (id: string) => api.get<{ data: ProjectLog }>(`/project-logs/${id}`),

  create: (data: { projectId: string; employeeId: string; action?: string; description?: string }) =>
    api.post<{ data: ProjectLog }>("/project-logs", data),
};

export default projectLogService;
