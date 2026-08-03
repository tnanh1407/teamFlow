import api from "@/lib/axios";

export interface ProjectLog {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  description: string;
  createdAt: string;
}

const mapLog = (log: { id: string; projectId: string; employeeId: string; action: string; description: string; createdAt: string }): ProjectLog => ({
  id: log.id,
  projectId: log.projectId,
  userId: log.employeeId,
  action: log.action,
  description: log.description,
  createdAt: log.createdAt,
});

const projectLogService = {
  getAll: async () => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; action: string; description: string; createdAt: string }> }>("/project-logs");
    return { data: { data: data.data.map(mapLog) } };
  },

  getByProject: async (projectId: string) => {
    const { data } = await api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; action: string; description: string; createdAt: string }> }>(`/project-logs/project/${projectId}`);
    return { data: { data: data.data.map(mapLog) } };
  },

  getByUser: (userId: string) =>
    api.get<{ data: Array<{ id: string; projectId: string; employeeId: string; action: string; description: string; createdAt: string }> }>(`/project-logs/employee/${userId}`),

  getById: async (id: string) => {
    const { data } = await api.get<{ data: { id: string; projectId: string; employeeId: string; action: string; description: string; createdAt: string } }>(`/project-logs/${id}`);
    return { data: { data: mapLog(data.data) } };
  },

  create: (data: { projectId: string; userId: string; action?: string; description?: string }) =>
    api.post("/project-logs", { ...data, employeeId: data.userId }),
};

export default projectLogService;
