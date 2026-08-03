import api from "@/lib/axios";

export type AccountRole = "admin" | "user";

export type AccountPosition ="manager" | "member";

export interface Account {
  id: string;
  employeeId: string;
  username: string;
  role: AccountRole;
  position: AccountPosition;
  status: boolean;
  avatarURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: Account;
  token: string;
}

export interface UpdateMePayload {
  currentPassword: string;
  newPassword: string;
}

const accountService = {
  login: (data: LoginPayload) =>
    api.post<{ data: LoginResponse }>("/users/login", data),

  me: () => api.get<{ data: Account }>("/users/me"),

  logout: () => api.post("/users/logout"),

  getAll: () => api.get<{ data: Account[] }>("/users"),

  getById: (id: string) => api.get<{ data: Account }>(`/users/${id}`),

  create: (data: Omit<Account, "id" | "createdAt" | "updatedAt"> & { password: string }) =>
    api.post<{ data: Account }>("/users", data),

  update: (id: string, data: Partial<Account>) =>
    api.patch<{ data: Account }>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  updateMe: (data: UpdateMePayload) =>
    api.patch<{ data: Account }>("/users/updatePs", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<{ data: Account }>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default accountService;
