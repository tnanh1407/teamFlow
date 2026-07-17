import api from "@/lib/axios";

export interface User {
  _id: string;
  employeeId: string;
  username: string;
  role: "admin" | "user";
  status: boolean;
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

const userService = {
  login: (data: LoginPayload) =>
    api.post<{ data: LoginResponse }>("/users/login", data),

  logout: () => api.post("/users/logout"),

  getAll: () => api.get<{ data: User[] }>("/users"),

  getById: (id: string) => api.get<{ data: User }>(`/users/${id}`),

  create: (data: Omit<User, "_id" | "createdAt" | "updatedAt"> & { password: string }) =>
    api.post<{ data: User }>("/users", data),

  update: (id: string, data: Partial<User>) =>
    api.patch<{ data: User }>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

export default userService;
