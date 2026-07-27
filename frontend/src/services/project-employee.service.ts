import api from "@/lib/axios";

export interface ProjectEmployee {
  id: string;
  projectId: string;
  employeeId: string;
  role: string;
  assignedAt: string;
}

const projectEmployeeService = {
  getByProject: (projectId: string) =>
    api.get<{ data: ProjectEmployee[] }>(`/project-employees/project/${projectId}`),

  create: (data: { projectId: string; employeeId: string; role?: string }) =>
    api.post<{ data: ProjectEmployee }>("/project-employees", data),

  delete: (id: string) =>
    api.delete(`/project-employees/${id}`),
};

export default projectEmployeeService;