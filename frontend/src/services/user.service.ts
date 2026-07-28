import api from "@/lib/axios";

export type UserRole = "admin" | "user";

export type UserPosition ="manager" | "member";

export interface User {
  id: string;
  employeeId: string;
  username: string;
  role: UserRole;
  position: UserPosition;
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
  user: User;
  token: string;
}

export interface UpdateMePayload {
  currentPassword: string;
  newPassword: string;
}

const userService = {
  login: (data: LoginPayload) =>
    api.post<{ data: LoginResponse }>("/users/login", data),

  logout: () => api.post("/users/logout"),

  getAll: () => api.get<{ data: User[] }>("/users"),

  getById: (id: string) => api.get<{ data: User }>(`/users/${id}`),

  create: (data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }) =>
    api.post<{ data: User }>("/users", data),

  update: (id: string, data: Partial<User>) =>
    api.patch<{ data: User }>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  updateMe: (data: UpdateMePayload) =>
    api.patch<{ data: User }>("/users/me", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<{ data: User }>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default userService;
