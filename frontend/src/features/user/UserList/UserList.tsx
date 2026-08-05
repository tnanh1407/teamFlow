import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/stores/auth"
import { MySwal, showDeleteConfirm, showErrorAlert, showSuccessAlert } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import LoadingState from "@/shared/ui/LoadingState"
import type { User } from "@/services/user.service"
import openUserFormDialog from "./components/UserFormDialog"
import UserListToolbar from "./components/UserListToolbar"
import UserListTable from "./components/UserListTable"
import {
  useUsersQuery,
  useDepartmentsQuery,
  usePositionsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../user.queries"

export default function UserList() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const usersQuery = useUsersQuery()
  const departmentsQuery = useDepartmentsQuery()
  const positionsQuery = usePositionsQuery()
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  useEffect(() => {
    if (usersQuery.isError || departmentsQuery.isError || positionsQuery.isError) {
      void showErrorAlert("Không thể tải dữ liệu người dùng")
    }
  }, [usersQuery.isError, departmentsQuery.isError, positionsQuery.isError])

  const deptNameMap = useMemo(
    () => new Map((departmentsQuery.data ?? []).map((d) => [d.id, d.name] as const)),
    [departmentsQuery.data]
  )
  const posNameMap = useMemo(
    () => new Map((positionsQuery.data ?? []).map((p) => [p.id, p.name] as const)),
    [positionsQuery.data]
  )

  const visibleUsers = useMemo(() => {
    const users = usersQuery.data ?? []
    if (currentUser?.role === "admin") return users
    if (currentUser?.position === "manager" && currentUser.departmentId) {
      return users.filter((u) => u.departmentId === currentUser.departmentId)
    }
    return users
  }, [currentUser, usersQuery.data])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visibleUsers
    return visibleUsers.filter((u) =>
      [u.employeeCode, u.username, u.name, u.email].join(" ").toLowerCase().includes(query)
    )
  }, [search, visibleUsers])

  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers]
    if (!sortDir) return arr
    arr.sort((a, b) => {
      const cmp = a.username.localeCompare(b.username)
      return sortDir === "asc" ? cmp : -cmp
    })
    return arr
  }, [filteredUsers, sortDir])

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const canEdit = (target: User) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return target.id !== currentUser.id
    if (currentUser.position === "manager") {
      return target.id !== currentUser.id && target.position !== "manager"
    }
    return false
  }

  const canDelete = (target: User) => canEdit(target)

  const openFormDialog = async (editingUser?: User) => {
    try {
      const result = await openUserFormDialog({
        editingUser,
        departments: departmentsQuery.data ?? [],
        positions: positionsQuery.data ?? [],
        onSubmit: async (payload) => {
          if (editingUser) {
            await updateUserMutation.mutateAsync({ id: editingUser.id, payload })
          } else {
            await createUserMutation.mutateAsync(payload)
          }
        },
      })
      if (!result || !result.changed) return
      void showSuccessAlert(editingUser ? "Cập nhật thành công" : "Tạo mới thành công")
    } catch (err: any) {
      void showErrorAlert(err?.response?.data?.message || "Lưu thất bại")
    }
  }

  const confirmDelete = async (e: MouseEvent, user: User) => {
    e.stopPropagation()
    const confirmed = await showDeleteConfirm({
      name: user.username,
      html: `Bạn có chắc muốn xoá người dùng <strong>${user.username}</strong>? Hành động này không thể hoàn tác.`,
    })
    if (!confirmed) return

    try {
      await deleteUserMutation.mutateAsync(user.id)
      void showSuccessAlert("Xoá thành công")
    } catch {
      void showErrorAlert("Xoá thất bại")
    }
  }

  const handleView = (user: User) => navigate(`/users/${user.id}`)
  const handleEdit = (user: User) => openFormDialog(user)
  const handleToggleStatus = async (user: User) => {
    const nextStatus = !user.status
    const result = await MySwal.fire({
      icon: "question",
      title: nextStatus ? "Kích hoạt người dùng?" : "Vô hiệu người dùng?",
      html: nextStatus
        ? `Người dùng <strong>${user.username}</strong> sẽ được chuyển sang trạng thái hoạt động.`
        : `Người dùng <strong>${user.username}</strong> sẽ bị vô hiệu và ghi nhận ngày nghỉ việc hôm nay.`,
      showCancelButton: true,
      confirmButtonText: nextStatus ? "Kích hoạt" : "Vô hiệu",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      const todayKey = new Date().toISOString().slice(0, 10)
      await updateUserMutation.mutateAsync({
        id: user.id,
        payload: {
          status: nextStatus,
          leaveDate: nextStatus ? undefined : todayKey,
        },
      })
      void showSuccessAlert(nextStatus ? "Kích hoạt thành công" : "Đã vô hiệu người dùng")
    } catch (err: any) {
      void showErrorAlert(err?.response?.data?.message || "Cập nhật trạng thái thất bại")
    }
  }

  const loading = usersQuery.isPending || departmentsQuery.isPending || positionsQuery.isPending

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        desc="Quản lý tài khoản người dùng trong hệ thống"
      />

      <UserListToolbar
        search={search}
        sortDir={sortDir}
        onAdd={() => openFormDialog()}
        onSearchChange={setSearch}
        onToggleSort={toggleSort}
      />

      <UserListTable
        loading={loading}
        users={sortedUsers}
        deptNameMap={deptNameMap}
        posNameMap={posNameMap}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={confirmDelete}
      />
    </div>
  )
}
