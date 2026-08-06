import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/stores/auth"
import { MySwal, showDeleteConfirm, showErrorAlert, showSuccessAlert } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import LoadingState from "@/shared/ui/LoadingState"
import type { User } from "@/services/user.service"
import openUserFormDialog from "./components/UserFormDialog"
import UserListCard from "./components/UserListCard"
import UserListToolbar from "./components/UserListToolbar"
import UserListTable from "./components/UserListTable"
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
  useDepartmentsQuery,
  usePositionsQuery,
} from "../../mutations/user.mutations"

export default function UserList() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role">("name-asc")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const usersQuery = useUsersQuery()
  const departmentsQuery = useDepartmentsQuery()
  const positionsQuery = usePositionsQuery()
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  // Nếu bất kỳ nguồn dữ liệu nào lỗi, hiển thị thông báo lỗi chung cho màn hình danh sách.
  useEffect(() => {
    if (usersQuery.isError || departmentsQuery.isError || positionsQuery.isError) {
      void showErrorAlert("Không thể tải dữ liệu người dùng")
    }
  }, [usersQuery.isError, departmentsQuery.isError, positionsQuery.isError])

  // Tạo map tra cứu nhanh tên phòng ban theo ID để dùng trong bảng.
  const deptNameMap = useMemo(
    () => new Map((departmentsQuery.data ?? []).map((d) => [d.id, d.name] as const)),
    [departmentsQuery.data]
  )
  // Tạo map tra cứu nhanh tên chức vụ theo ID để dùng trong bảng.
  const posNameMap = useMemo(
    () => new Map((positionsQuery.data ?? []).map((p) => [p.id, p.name] as const)),
    [positionsQuery.data]
  )

  // Giới hạn dữ liệu người dùng theo quyền hiện tại của tài khoản đăng nhập.
  const visibleUsers = useMemo(() => {
    const users = usersQuery.data ?? []
    if (currentUser?.role === "admin") return users
    if (currentUser?.position === "manager" && currentUser.departmentId) {
      return users.filter((u) => u.departmentId === currentUser.departmentId)
    }
    return users
  }, [currentUser, usersQuery.data])

  // Lọc danh sách theo từ khóa tìm kiếm ở toolbar.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visibleUsers
    return visibleUsers.filter((u) =>
      [u.employeeCode, u.username, u.name, u.email].join(" ").toLowerCase().includes(query)
    )
  }, [search, visibleUsers])

  // Sắp xếp danh sách theo tiêu chí đang chọn ở select.
  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers]
    arr.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name)
      if (sortBy === "name-desc") return b.name.localeCompare(a.name)
      if (sortBy === "hire-newest") {
        return new Date(b.hireDate || 0).getTime() - new Date(a.hireDate || 0).getTime()
      }
      if (sortBy === "hire-oldest") {
        return new Date(a.hireDate || 0).getTime() - new Date(b.hireDate || 0).getTime()
      }

      const roleOrder = { admin: 0, user: 1 } as const
      const roleDelta = roleOrder[a.role] - roleOrder[b.role]
      if (roleDelta !== 0) return roleDelta
      return a.name.localeCompare(b.name)
    })
    return arr
  }, [filteredUsers, sortBy])

  // Tính tổng số trang dựa trên số bản ghi sau lọc và sắp xếp.
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  // Cắt dữ liệu sang đúng trang hiện tại trước khi đổ vào bảng.
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [currentPage, sortedUsers])

  // Khi đổi tìm kiếm hoặc kiểu sắp xếp, quay về trang đầu để tránh ở lại trang không còn dữ liệu.
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy])

  // Nếu số trang giảm xuống dưới trang hiện tại, tự kéo về trang cuối hợp lệ.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Quyết định ai có thể sửa người dùng nào dựa trên vai trò và phòng ban.
  const canEdit = (target: User) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return target.id !== currentUser.id
    if (currentUser.position === "manager") {
      return target.id !== currentUser.id && target.position !== "manager"
    }
    return false
  }

  const canDelete = (target: User) => canEdit(target)

  // Mở hộp thoại tạo mới hoặc chỉnh sửa thông tin người dùng.
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

  // Xác nhận rồi xoá người dùng khỏi hệ thống.
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

  // Điều hướng sang trang chi tiết người dùng.
  const handleView = (user: User) => navigate(`/users/${user.id}`)
  // Mở form ở chế độ chỉnh sửa.
  const handleEdit = (user: User) => openFormDialog(user)
  // Bật/tắt trạng thái hoạt động của người dùng sau khi xác nhận.
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
    <div className="space-y-8">
      <PageHeader
        title="Quản lý người dùng"
        desc="Quản lý tài khoản người dùng trong hệ thống"
      />

      <UserListToolbar
        search={search}
        sortBy={sortBy}
        viewMode={viewMode}
        onAdd={() => openFormDialog()}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onToggleView={() => setViewMode((mode) => (mode === "list" ? "grid" : "list"))}
      />

      {viewMode === "list" ? (
        <UserListTable
          loading={loading}
          users={paginatedUsers}
          deptNameMap={deptNameMap}
          posNameMap={posNameMap}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={confirmDelete}
        />
      ) : loading ? (
        <LoadingState />
      ) : paginatedUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
          Không tìm thấy người dùng nào
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {paginatedUsers.map((item) => {
            const deptName = deptNameMap.get(item.departmentId || "") || "—"
            const posName = posNameMap.get(item.positionId || "") || "—"

            return (
              <UserListCard
                key={item.id}
                user={item}
                departmentName={deptName}
                positionName={posName}
                canEdit={canEdit(item)}
                canDelete={canDelete(item)}
                onView={handleView}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={confirmDelete}
              />
            )
          })}
        </div>
      )}

      {!loading && sortedUsers.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Đang hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedUsers.length)} trên {sortedUsers.length} người dùng
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                const isActive = page === currentPage
                const isCompact = totalPages > 7
                const shouldShow =
                  !isCompact ||
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1

                if (!shouldShow) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-muted-foreground">…</span>
                  }
                  return null
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
