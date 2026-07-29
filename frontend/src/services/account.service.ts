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
  account: Account;
  token: string;
}

export interface UpdateMePayload {
  currentPassword: string;
  newPassword: string;
}

const accountService = {
  login: (data: LoginPayload) =>
    api.post<{ data: LoginResponse }>("/accounts/login", data),

  logout: () => api.post("/accounts/logout"),

  getAll: () => api.get<{ data: Account[] }>("/accounts"),

  getById: (id: string) => api.get<{ data: Account }>(`/accounts/${id}`),

  create: (data: Omit<Account, "id" | "createdAt" | "updatedAt"> & { password: string }) =>
    api.post<{ data: Account }>("/accounts", data),

  update: (id: string, data: Partial<Account>) =>
    api.patch<{ data: Account }>(`/accounts/${id}`, data),

  delete: (id: string) => api.delete(`/accounts/${id}`),

  updateMe: (data: UpdateMePayload) =>
    api.patch<{ data: Account }>("/accounts/me", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<{ data: Account }>("/accounts/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default accountService;