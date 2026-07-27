import api from "@/lib/axios";

export interface Position {
  id: string;
  name: string;
  description: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

const positionService = {
  getAll: () => api.get<{ data: Position[] }>("/positions"),

  getById: (id: string) => api.get<{ data: Position }>(`/positions/${id}`),

  create: (data: { name: string; description?: string; level?: string }) =>
    api.post<{ data: Position }>("/positions", data),

  update: (id: string, data: Partial<{ name: string; description: string; level: string }>) =>
    api.patch<{ data: Position }>(`/positions/${id}`, data),

  delete: (id: string) => api.delete(`/positions/${id}`),
};

export default positionService;
