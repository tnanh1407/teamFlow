import api from "@/lib/axios";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  assignedAt: string;
}

const mapMember = (member: { id: string; projectId: string; employeeId: string; role: string; assignedAt: string }): ProjectMember => ({
  id: member.id,
  projectId: member.projectId,
  userId: member.employeeId,
  role: member.role,
  assignedAt: member.assignedAt,
});

const projectMemberService = {
  getAll: async () => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>("/project-employees");
    return { data: { data: data.data.map(mapMember) } };
  },

  getByUser: (userId: string) =>
    api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>(`/project-employees/employee/${userId}`),

  getByProject: async (projectId: string) => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; role: string; assignedAt: string }> }>(`/project-employees/project/${projectId}`);
    return { data: { data: data.data.map(mapMember) } };
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ data: { id: string; projectId: string; employeeId: string; role: string; assignedAt: string } }>(`/project-employees/${id}`);
    return { data: { data: mapMember(data.data) } };
  },

  create: (data: { projectId: string; userId: string; role?: string }) =>
    api.post("/project-employees", { ...data, employeeId: data.userId }),

  delete: (id: string) =>
    api.delete(`/project-employees/${id}`),
};

export default projectMemberService;
