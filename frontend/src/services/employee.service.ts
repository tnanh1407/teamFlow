import api from "@/lib/axios";

export interface Employee {
  id: string;
  departmentId: string;
  positionId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  hireDate: string;
  gender: "male" | "female" | "other";
  status: "active" | "probation" | "inactive";
  avatarURL: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

const employeeService = {
  getAll: () => api.get<{ data: Employee[] }>("/employees"),

  getById: (id: string) => api.get<{ data: Employee }>(`/employees/${id}`),

  getByDepartment: (departmentId: string) =>
    api.get<{ data: Employee[] }>(`/employees/department/${departmentId}`),

  getByPosition: (positionId: string) =>
    api.get<{ data: Employee[] }>(`/employees/position/${positionId}`),

  create: (data: FormData) =>
    api.post<{ data: Employee }>("/employees", data),

  update: (id: string, data: FormData) =>
    api.patch<{ data: Employee }>(`/employees/${id}`, data),

  delete: (id: string) => api.delete(`/employees/${id}`),
};

export default employeeService;
