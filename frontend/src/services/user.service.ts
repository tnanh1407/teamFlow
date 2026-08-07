import api from "@/lib/axios";

export type AccountRole = "admin" | "user";
export type AccountPosition = "manager" | "leader" | "staff" | "intern";
export type UserGender = "male" | "female" | "other";

export interface User {
  id: string;
  departmentId: string | null;
  positionId: string | null;
  employeeCode: string | null;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  hireDate: string;
  leaveDate: string;
  gender: UserGender;
  username: string;
  role: AccountRole;
  position: AccountPosition | null;
  status: boolean;
  avatarURL: string;
  deletedAt: string | null;
  deletedBy: string | null;
  deletionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: BackendUser;
  token: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
  employeeCode: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSearchParams {
  q: string;
  page?: number;
  limit?: number;
  departmentId?: string;
  role?: AccountRole;
  positionId?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role";
}

type BackendUser = {
  id: string;
  departmentId: string | null;
  positionId: string | null;
  employeeCode: string | null;
  name: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  hireDate?: string | null;
  leaveDate?: string | null;
  gender?: UserGender | string | null;
  username: string;
  role?: AccountRole | string | null;
  position?: AccountPosition | string | null;
  status?: boolean | null;
  avatarURL?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

const normalizeUser = (user: BackendUser): User => ({
  id: user.id,
  departmentId: user.departmentId ?? "",
  positionId: user.positionId ?? "",
  employeeCode: user.employeeCode ?? null,
  name: user.name ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  birthDate: user.birthDate ?? "",
  hireDate: user.hireDate ?? "",
  leaveDate: user.leaveDate ?? "",
  gender: (user.gender as UserGender) ?? "other",
  username: user.username ?? "",
  role: (user.role as AccountRole) ?? "user",
  position:
    (user.position ??
    (user.positionId === "20000000-0000-4000-a000-000000000001"
      ? "manager"
      : user.positionId === "20000000-0000-4000-a000-000000000010"
        ? "leader"
      : user.positionId === "20000000-0000-4000-a000-000000000005"
        ? "staff"
        : user.positionId === "20000000-0000-4000-a000-000000000006"
          ? "intern"
          : null)) as AccountPosition | null,
  status: user.status ?? true,
  avatarURL: user.avatarURL ?? "",
  deletedAt: user.deletedAt ?? null,
  deletedBy: user.deletedBy ?? null,
  deletionReason: user.deletionReason ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const userService = {
  login: async (data: LoginPayload) => {
    const { data: response } = await api.post<{ data: LoginResponse }>("/users/login", data);
    return { data: { data: { user: normalizeUser(response.data.user), token: response.data.token } } };
  },

  me: async () => {
    const { data } = await api.get<{ data: BackendUser }>("/users/me");
    return { data: { data: normalizeUser(data.data) } };
  },

  logout: () => api.post("/users/logout"),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post<{ message: string; data?: { devCode?: string } }>("/users/forgot-password", data),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    api.post<{ message: string }>("/users/reset-password", data),

  updatePassword: (data: UpdatePasswordPayload) =>
    api.patch<{ message: string }>("/users/updatePs", data),

  getAll: async () => {
    const { data } = await api.get<{ data: BackendUser[] }>("/users/all");
    return { data: { data: data.data.map(normalizeUser) } };
  },

  search: async (params: UserSearchParams) => {
    const { data } = await api.get<{
      data: BackendUser[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/users/search", {
      params,
    });
    return {
      data: {
        data: data.data.map(normalizeUser),
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      },
    };
  },

  getTrash: async (params: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get<{
      data: BackendUser[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/users/trash", { params });
    return {
      data: {
        data: data.data.map(normalizeUser),
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      },
    };
  },

  restore: async (id: string) => {
    const { data } = await api.patch<{ data: BackendUser }>(`/users/${id}/restore`);
    return { data: { data: normalizeUser(data.data) } };
  },

  hardDelete: (id: string) => api.delete(`/users/${id}/permanent`),

  getById: async (id: string) => {
    const { data } = await api.get<{ data: BackendUser }>(`/users/${id}`);
    return { data: { data: normalizeUser(data.data) } };
  },

  getByDepartment: async (departmentId: string) => {
    const { data } = await api.get<{ data: BackendUser[] }>(`/users/department/${departmentId}`);
    return { data: { data: data.data.map(normalizeUser) } };
  },

  getByPosition: async (positionId: string) => {
    const { data } = await api.get<{ data: BackendUser[] }>(`/users/position/${positionId}`);
    return { data: { data: data.data.map(normalizeUser) } };
  },

  create: async (data: FormData | Record<string, unknown>) => {
    const { data: response } = await api.post<{ data: BackendUser }>("/users", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return { data: { data: normalizeUser(response.data) } };
  },

  update: async (id: string, data: FormData | Record<string, unknown>) => {
    const { data: response } = await api.patch<{ data: BackendUser }>(`/users/${id}`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return { data: { data: normalizeUser(response.data) } };
  },

  delete: (id: string) => api.delete(`/users/${id}`),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<{ message: string }>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  removeAvatar: () => api.delete("/users/me/avatar"),
};

export default userService;
