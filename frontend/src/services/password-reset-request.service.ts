import api from "@/lib/axios"

export type PasswordResetRequestStatus = "pending" | "approved" | "rejected" | "all"

export interface PasswordResetRequest {
  id: string
  userId: string
  name: string
  username: string
  email: string
  employeeCode: string | null
  departmentName: string | null
  status: Exclude<PasswordResetRequestStatus, "all">
  requestedAt: string
  processedAt: string | null
}

const passwordResetRequestService = {
  getAll: (status: PasswordResetRequestStatus = "pending") =>
    api.get<{ data: PasswordResetRequest[] }>("/users/password-reset-requests", { params: { status } }),

  approve: (id: string) => api.patch<{ message: string }>(`/users/password-reset-requests/${id}/approve`),

  reject: (id: string) => api.patch<{ message: string }>(`/users/password-reset-requests/${id}/reject`),
}

export default passwordResetRequestService
