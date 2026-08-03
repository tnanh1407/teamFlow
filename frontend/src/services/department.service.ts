import api from "@/lib/axios";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const departmentService = {
  getAll: () => api.get<{ data: Department[] }>("/departments"),

  getById: (id: string) => api.get<{ data: Department }>(`/departments/${id}`),

  getProjectsByDepartment: (id: string) =>
    api.get<{ data: unknown[] }>(`/departments/${id}/projects`),

  create: (data: { name: string; code: string; description?: string; isActive?: boolean }) =>
    api.post<{ data: Department }>("/departments", data),

  update: (id: string, data: Partial<Department>) =>
    api.patch<{ data: Department }>(`/departments/${id}`, data),

  delete: (id: string) => api.delete(`/departments/${id}`),
};

export default departmentService;
