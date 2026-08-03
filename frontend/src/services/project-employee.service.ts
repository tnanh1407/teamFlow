import api from "@/lib/axios";

export interface ProjectEmployee {
  id: string;
  projectId: string;
  employeeId: string;
  role: string;
  assignedAt: string;
}

const projectEmployeeService = {
  getAll: () => api.get<{ data: ProjectEmployee[] }>("/project-employees"),

  getByEmployee: (employeeId: string) =>
    api.get<{ data: ProjectEmployee[] }>(`/project-employees/employee/${employeeId}`),

  getByProject: (projectId: string) =>
    api.get<{ data: ProjectEmployee[] }>(`/project-employees/project/${projectId}`),

  getById: (id: string) =>
    api.get<{ data: ProjectEmployee }>(`/project-employees/${id}`),

  create: (data: { projectId: string; employeeId: string; role?: string }) =>
    api.post<{ data: ProjectEmployee }>("/project-employees", data),

  delete: (id: string) =>
    api.delete(`/project-employees/${id}`),
};

export default projectEmployeeService;
