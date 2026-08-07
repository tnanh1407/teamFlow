import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"
import userService, {
  type ForgotPasswordPayload,
  type LoginPayload,
  type PaginatedUsersResponse,
  type User,
  type UserSearchParams,
} from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"

type MutationError = unknown
type UserPayload = Record<string, unknown> | FormData

export const userQueryKeys = {
  all: ["users"] as const,
  search: (params: UserSearchParams) => ["users", "search", params] as const,
  departments: ["users", "departments"] as const,
  positions: ["users", "positions"] as const,
}

export function useForgotPasswordMutation(
  options?: UseMutationOptions<{ message: string; data?: { devCode?: string } }, MutationError, ForgotPasswordPayload>
) {
  return useMutation({
    ...options,
    mutationFn: async (values: ForgotPasswordPayload) => {
      const { data } = await userService.forgotPassword(values)
      return data
    },
  })
}

export function useUsersQuery() {
  return useQuery<User[]>({
    queryKey: userQueryKeys.all,
    queryFn: async () => {
      const { data } = await userService.getAll()
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useUsersSearchQuery(params: UserSearchParams, enabled: boolean) {
  return useQuery<PaginatedUsersResponse>({
    queryKey: userQueryKeys.search(params),
    queryFn: async () => {
      const { data } = await userService.search(params)
      return data
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useDepartmentsQuery() {
  return useQuery<Department[]>({
    queryKey: userQueryKeys.departments,
    queryFn: async () => {
      const { data } = await departmentService.getAll()
      return data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function useActiveDepartmentsQuery() {
  return useQuery<Pick<Department, "id" | "name" | "code">[]>({
    queryKey: ["departments", "active-options"],
    queryFn: async () => {
      const { data } = await departmentService.getActiveOptions()
      return data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function usePositionsQuery() {
  return useQuery<Position[]>({
    queryKey: userQueryKeys.positions,
    queryFn: async () => {
      const { data } = await positionService.getAll()
      return data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UserPayload) => {
      const { data } = await userService.create(payload)
      return data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UserPayload }) => {
      const { data } = await userService.update(id, payload)
      return data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await userService.delete(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}

export function useLoginMutation(options?: UseMutationOptions<User, MutationError, LoginPayload>) {
  return useMutation({
    ...options,
    mutationFn: async (values: LoginPayload) => {
      const { data } = await userService.login(values)
      return data.data.user
    },
  })
}
