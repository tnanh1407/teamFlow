import api from "@/lib/axios";

export interface Session {
  id: string;
  userId: string;
  jti: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  isCurrent?: boolean;
}

const sessionService = {
  getMySessions: () => api.get<{ data: Session[] }>("/sessions/me"),

  logoutAll: () => api.delete<{ message: string }>("/sessions/me"),

  revokeById: (id: string) => api.delete<{ message: string }>(`/sessions/${id}`),
};

export default sessionService;
