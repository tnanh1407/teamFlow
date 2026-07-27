import api from "@/lib/axios";

export interface ProjectDepartment {
  projectId: string;
  departmentId: string;
  assignedAt: string;
}

const projectDepartmentService = {
  getByProject: (projectId: string) =>
    api.get<{ data: ProjectDepartment[] }>(`/project-departments/project/${projectId}`),

  create: (data: { projectId: string; departmentId: string }) =>
    api.post<{ data: ProjectDepartment }>("/project-departments", data),

  delete: (projectId: string, departmentId: string) =>
    api.delete(`/project-departments/${projectId}/${departmentId}`),
};

export default projectDepartmentService;
