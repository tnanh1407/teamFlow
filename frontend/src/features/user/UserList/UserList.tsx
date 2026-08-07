import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/stores/auth"
import { MySwal } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import PageSeo from "@/shared/ui/PageSeo"
import LoadingState from "@/shared/ui/LoadingState"
import type { AccountRole, User } from "@/services/user.service"
import openUserFormEditDialog from "./components/UserFormEditDialog"
import UserListToolbar from "./components/UserListToolbar"
import UserListTable from "./components/UserListTable"
import UserListFilters, { type UserListFiltersValue } from "./components/UserListFilters"
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useDepartmentsQuery,
  usePositionsQuery,
  useUpdateUserMutation,
  useUsersQuery,
  useUsersSearchQuery,
} from "../../mutations/user.mutations"
import openUserFormAddDialog from "./components/UserFormAddDialog"

const pageSize = 10
const SEARCH_DEBOUNCE_MS = 450

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const response = Reflect.get(error, "response")
    if (typeof response === "object" && response !== null) {
      const data = Reflect.get(response, "data")
      if (typeof data === "object" && data !== null) {
        const message = Reflect.get(data, "message")
        if (typeof message === "string" && message.trim()) return message
      }
    }
  }

  return fallback
}

function buildFilterChips(
  filters: UserListFiltersValue,
  deptNameMap: Map<string, string>,
  posNameMap: Map<string, string>
) {
  const chips: Array<{ key: string; label: string }> = []

  if (filters.departmentId) {
    chips.push({
      key: "departmentId",
      label: `Phòng ban: ${deptNameMap.get(filters.departmentId) ?? "Đã chọn"}`,
    })
  }

  if (filters.roleOrPosition) {
    if (filters.roleOrPosition.startsWith("role:")) {
      const role = filters.roleOrPosition.replace("role:", "") as AccountRole
      chips.push({
        key: "roleOrPosition",
        label: `Vai trò: ${role === "admin" ? "Quản trị viên" : "Tài khoản người dùng"}`,
      })
    } else if (filters.roleOrPosition.startsWith("position:")) {
      const positionId = filters.roleOrPosition.replace("position:", "")
      chips.push({
        key: "roleOrPosition",
        label: `Chức vụ: ${posNameMap.get(positionId) ?? "Đã chọn"}`,
      })
    }
  }

  if (filters.status !== "all") {
    chips.push({
      key: "status",
      label: `Trạng thái: ${filters.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}`,
    })
  }

  return chips
}

export default function UserList() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const listTopRef = useRef<HTMLDivElement | null>(null)
  const isFirstPageRender = useRef(true)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [hasActivatedAutoSearch, setHasActivatedAutoSearch] = useState(false)
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role">("name-asc")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<UserListFiltersValue>({
    departmentId: "",
    roleOrPosition: "",
    status: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({})
  const [pendingStatusMap, setPendingStatusMap] = useState<Record<string, boolean>>({})

  const normalizedSearch = search.trim()
  const isAdmin = currentUser?.role === "admin"
  const canUseSearchApi = isAdmin && normalizedSearch.length > 0

  const roleFilter = filters.roleOrPosition.startsWith("role:")
    ? (filters.roleOrPosition.replace("role:", "") as AccountRole)
    : undefined
  const positionFilter = filters.roleOrPosition.startsWith("position:")
    ? filters.roleOrPosition.replace("position:", "")
    : undefined

  const searchParams = useMemo(
    () => ({
      q: normalizedSearch,
      page: currentPage,
      limit: pageSize,
      departmentId: filters.departmentId || undefined,
      role: roleFilter,
      positionId: positionFilter,
      status: filters.status,
      sortBy,
    }),
    [currentPage, filters.departmentId, filters.status, normalizedSearch, positionFilter, roleFilter, sortBy]
  )

  const usersQuery = useUsersQuery()
  const usersSearchQuery = useUsersSearchQuery(searchParams, canUseSearchApi)
  const departmentsQuery = useDepartmentsQuery()
  const positionsQuery = usePositionsQuery()
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  useEffect(() => {
    if (usersQuery.isError || usersSearchQuery.isError || departmentsQuery.isError || positionsQuery.isError) {
      void MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu nhân viên",
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    }
  }, [departmentsQuery.isError, positionsQuery.isError, usersQuery.isError, usersSearchQuery.isError])

  useEffect(() => {
    if (!hasActivatedAutoSearch) return

    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [hasActivatedAutoSearch, searchInput])

  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false
      return
    }

    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [currentPage])

  const deptNameMap = useMemo(
    () => new Map((departmentsQuery.data ?? []).map((department) => [department.id, department.name] as const)),
    [departmentsQuery.data]
  )
  const posNameMap = useMemo(
    () => new Map((positionsQuery.data ?? []).map((position) => [position.id, position.name] as const)),
    [positionsQuery.data]
  )

  const visibleUsers = useMemo(() => {
    const sourceUsers = canUseSearchApi ? (usersSearchQuery.data?.data ?? []) : (usersQuery.data ?? [])
    const usersWithStatus = sourceUsers.map((user) =>
      statusOverrides[user.id] === undefined ? user : { ...user, status: statusOverrides[user.id] }
    )

    if (canUseSearchApi) return usersWithStatus
    if (isAdmin) return usersWithStatus
    if (currentUser?.position === "manager" && currentUser.departmentId) {
      return usersWithStatus.filter((user) => user.departmentId === currentUser.departmentId)
    }

    return usersWithStatus
  }, [canUseSearchApi, currentUser, isAdmin, statusOverrides, usersQuery.data, usersSearchQuery.data?.data])

  const filteredUsers = useMemo(() => {
    if (canUseSearchApi) return visibleUsers

    const query = normalizedSearch.toLowerCase()

    return visibleUsers.filter((user) => {
      const matchesSearch =
        !query ||
        [
          user.id,
          user.employeeCode,
          user.username,
          user.name,
          user.email,
          user.phone,
          deptNameMap.get(user.departmentId ?? "") ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)

      const matchesDepartment = !filters.departmentId || user.departmentId === filters.departmentId

      const matchesRoleOrPosition =
        !filters.roleOrPosition ||
        (filters.roleOrPosition.startsWith("role:")
          ? user.role === filters.roleOrPosition.replace("role:", "")
          : user.positionId === filters.roleOrPosition.replace("position:", ""))

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" ? user.status : !user.status)

      return matchesSearch && matchesDepartment && matchesRoleOrPosition && matchesStatus
    })
  }, [canUseSearchApi, deptNameMap, filters, normalizedSearch, visibleUsers])

  const sortedUsers = useMemo(() => {
    if (canUseSearchApi) return filteredUsers

    const items = [...filteredUsers]

    items.sort((first, second) => {
      if (sortBy === "name-asc") return first.name.localeCompare(second.name)
      if (sortBy === "name-desc") return second.name.localeCompare(first.name)
      if (sortBy === "hire-newest") {
        return new Date(second.hireDate || 0).getTime() - new Date(first.hireDate || 0).getTime()
      }
      if (sortBy === "hire-oldest") {
        return new Date(first.hireDate || 0).getTime() - new Date(second.hireDate || 0).getTime()
      }

      const roleOrder: Record<AccountRole, number> = { admin: 0, user: 1 }
      const roleDelta = roleOrder[first.role] - roleOrder[second.role]
      if (roleDelta !== 0) return roleDelta
      return first.name.localeCompare(second.name)
    })

    return items
  }, [canUseSearchApi, filteredUsers, sortBy])

  const totalItems = canUseSearchApi ? (usersSearchQuery.data?.total ?? 0) : sortedUsers.length
  const totalPages = canUseSearchApi
    ? Math.max(1, usersSearchQuery.data?.totalPages ?? 1)
    : Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedUsers = useMemo(() => {
    if (canUseSearchApi) return sortedUsers
    const start = (safeCurrentPage - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [canUseSearchApi, safeCurrentPage, sortedUsers])

  const filterChips = useMemo(() => buildFilterChips(filters, deptNameMap, posNameMap), [deptNameMap, filters, posNameMap])
  const loading =
    usersQuery.isPending ||
    (canUseSearchApi && usersSearchQuery.isPending) ||
    departmentsQuery.isPending ||
    positionsQuery.isPending

  const canEdit = (target: User) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return target.id !== currentUser.id
    if (currentUser.position === "manager") {
      return target.id !== currentUser.id && target.position !== "manager"
    }
    return false
  }

  const canDelete = (target: User) => canEdit(target)

  const resetToFirstPage = () => setCurrentPage(1)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchSubmit = () => {
    setHasActivatedAutoSearch(true)
    setSearch(searchInput)
    resetToFirstPage()
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setSearch("")
    resetToFirstPage()
  }

  const handleSortChange = (value: "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role") => {
    setSortBy(value)
    resetToFirstPage()
  }

  const handleFiltersChange = (nextValue: UserListFiltersValue) => {
    setFilters(nextValue)
    resetToFirstPage()
  }

  const handleRemoveFilterChip = (key: string) => {
    if (key === "departmentId") handleFiltersChange({ ...filters, departmentId: "" })
    if (key === "roleOrPosition") handleFiltersChange({ ...filters, roleOrPosition: "" })
    if (key === "status") handleFiltersChange({ ...filters, status: "all" })
  }

  const handleClearFilters = () => {
    handleFiltersChange({ departmentId: "", roleOrPosition: "", status: "all" })
  }

  const openFormDialog = async (editingUser?: User) => {
    try {
      const result = editingUser
        ? await openUserFormEditDialog({
            editingUser,
            departments: departmentsQuery.data ?? [],
            positions: positionsQuery.data ?? [],
            onSubmit: async (payload) => {
              await updateUserMutation.mutateAsync({ id: editingUser.id, payload })
            },
          })
        : await openUserFormAddDialog({
            departments: departmentsQuery.data ?? [],
            positions: positionsQuery.data ?? [],
            onSubmit: async (payload) => {
              await createUserMutation.mutateAsync(payload)
            },
          })

      if (!result || !result.changed) return

      void MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: editingUser ? "Cập nhật nhân viên thành công" : "Thêm nhân viên thành công",
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    } catch (error: unknown) {
      void MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: getErrorMessage(error, "Lưu thay đổi thất bại"),
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    }
  }

  const confirmDelete = async (event: MouseEvent, user: User) => {
    event.stopPropagation()

    const confirmed = (
      await MySwal.fire({
        title: "Xác nhận xóa",
        icon: "warning",
        html: `Bạn có chắc muốn xóa nhân viên <strong>${user.name || user.username}</strong>? Hành động này không thể hoàn tác.`,
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        confirmButtonColor: "var(--destructive)",
        reverseButtons: true,
      })
    ).isConfirmed

    if (!confirmed) return

    try {
      await deleteUserMutation.mutateAsync(user.id)
      void MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã xóa nhân viên",
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    } catch (error: unknown) {
      void MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: getErrorMessage(error, "Xóa nhân viên thất bại"),
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    }
  }

  const handleView = (user: User) => navigate(`/users/${user.id}`)
  const handleEdit = (user: User) => void openFormDialog(user)

  const handleToggleStatus = async (user: User) => {
    if (!canEdit(user) || pendingStatusMap[user.id]) return

    const nextStatus = !user.status
    const confirmation =
      nextStatus ||
      (
        await MySwal.fire({
          icon: "warning",
          title: "Ngừng hoạt động nhân viên?",
          html: `Nhân viên <strong>${user.name || user.username}</strong> sẽ bị ngừng hoạt động và không thể đăng nhập cho đến khi được kích hoạt lại.`,
          showCancelButton: true,
          confirmButtonText: "Ngừng hoạt động",
          cancelButtonText: "Hủy",
          confirmButtonColor: "var(--destructive)",
          reverseButtons: true,
        })
      ).isConfirmed

    if (!confirmation) return

    setPendingStatusMap((current) => ({ ...current, [user.id]: true }))
    setStatusOverrides((current) => ({ ...current, [user.id]: nextStatus }))

    try {
      const todayKey = new Date().toISOString().slice(0, 10)
      await updateUserMutation.mutateAsync({
        id: user.id,
        payload: {
          status: nextStatus,
          leaveDate: nextStatus ? undefined : todayKey,
        },
      })

      void MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: nextStatus ? "Đã kích hoạt nhân viên" : "Đã ngừng hoạt động nhân viên",
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    } catch (error: unknown) {
      setStatusOverrides((current) => {
        const next = { ...current }
        delete next[user.id]
        return next
      })

      void MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: getErrorMessage(error, "Cập nhật trạng thái thất bại"),
        confirmButtonText: "Đóng",
        confirmButtonColor: "var(--primary)",
      })
    } finally {
      setPendingStatusMap((current) => {
        const next = { ...current }
        delete next[user.id]
        return next
      })
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải danh sách nhân viên..." />
  }

  const hasResults = totalItems > 0
  const rangeStart = hasResults ? (safeCurrentPage - 1) * pageSize + 1 : 0
  const rangeEnd = hasResults ? Math.min(safeCurrentPage * pageSize, totalItems) : 0

  return (
    <div ref={listTopRef} className="space-y-6 lg:space-y-7">
      <PageSeo
        title="Quản lý nhân viên"
        description="Theo dõi hồ sơ nhân viên, trạng thái hoạt động và thông tin tài khoản trong hệ thống."
      />

      <PageHeader
        title="Quản lý nhân viên"
        desc="Theo dõi hồ sơ nhân viên, trạng thái hoạt động và thông tin tài khoản trong hệ thống."
      />

      <UserListToolbar
        search={searchInput}
        sortBy={sortBy}
        filtersOpen={filtersOpen}
        activeFilterCount={filterChips.length}
        hasSearchValue={Boolean(searchInput || search)}
        onAdd={() => void openFormDialog()}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onSortChange={handleSortChange}
      />

      {filtersOpen ? (
        <UserListFilters
          departments={departmentsQuery.data ?? []}
          positions={positionsQuery.data ?? []}
          value={filters}
          activeChips={filterChips}
          onChange={handleFiltersChange}
          onRemoveChip={handleRemoveFilterChip}
          onClear={handleClearFilters}
        />
      ) : filterChips.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleRemoveFilterChip(chip.key)}
                className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
              >
                {chip.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      ) : null}

      <UserListTable
        loading={loading}
        users={paginatedUsers}
        deptNameMap={deptNameMap}
        posNameMap={posNameMap}
        canEdit={canEdit}
        canDelete={canDelete}
        pendingStatusMap={pendingStatusMap}
        showUuid={currentUser?.role === "admin"}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={confirmDelete}
      />

      {hasResults ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Đang hiển thị {rangeStart}-{rangeEnd} trên {totalItems} nhân viên
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang trước
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                const compact = totalPages > 7
                const visible =
                  !compact ||
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safeCurrentPage) <= 1

                if (!visible) {
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span key={page} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-9 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      page === safeCurrentPage
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
              disabled={safeCurrentPage === totalPages}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
