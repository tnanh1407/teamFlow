import api from "@/lib/axios";

export interface ProjectDepartment {
  projectId: string;
  departmentId: string;
  assignedAt: string;
}

const projectDepartmentService = {
  getAll: () =>
    api.get<{ data: ProjectDepartment[] }>("/project-departments"),

  getByProject: (projectId: string) =>
    api.get<{ data: ProjectDepartment[] }>(`/project-departments/project/${projectId}`),

  create: (data: { projectId: string; departmentId: string }) =>
    api.post<{ data: ProjectDepartment }>("/project-departments", data),

  delete: (projectIdOrData: string | { projectId: string; departmentId: string }, departmentId?: string) => {
    const data =
      typeof projectIdOrData === "string"
        ? { projectId: projectIdOrData, departmentId: departmentId ?? "" }
        : projectIdOrData;

    return api.delete("/project-departments", { data });
  },
};

export default projectDepartmentService;
