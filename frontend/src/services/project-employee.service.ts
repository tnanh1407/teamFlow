import api from "@/lib/axios"

export interface ProjectEmployee {
  id: string
  projectId: string
  userId: string
  role: string
  assignedAt: string
}

const mapEmployee = (employee: { id: string; projectId: string; employeeId: string; role: string; assignedAt: string }): ProjectEmployee => ({
  id: employee.id,
  projectId: employee.projectId,
  userId: employee.employeeId,
  role: employee.role,
  assignedAt: employee.assignedAt,
})

const projectEmployeeService = {
  getAll: async () => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>("/project-employees")
    return { data: { data: data.data.map(mapEmployee) } }
  },

  getByUser: (userId: string) =>
    api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>(`/project-employees/employee/${userId}`),

  getByProject: async (projectId: string) => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>(`/project-employees/project/${projectId}`)
    return { data: { data: data.data.map(mapEmployee) } }
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ data: { id: string; projectId: string; employeeId: string; role: string; assignedAt: string } }>(`/project-employees/${id}`)
    return { data: { data: mapEmployee(data.data) } }
  },

  create: (data: { projectId: string; userId: string; role?: string }) =>
    api.post("/project-employees", { ...data, employeeId: data.userId }),

  delete: (id: string) =>
    api.delete(`/project-employees/${id}`),
}

export default projectEmployeeService
