import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"

export const userQueryKeys = {
  all: ["users"] as const,
  departments: ["users", "departments"] as const,
  positions: ["users", "positions"] as const,
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
    mutationFn: async (payload: Record<string, unknown>) => {
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
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
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
