import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/stores/auth"
import { MySwal, showDeleteConfirm } from "@/lib/swal"
import PageHeader from "@/shared/ui/PageHeader"
import LoadingState from "@/shared/ui/LoadingState"
import userService, { type User } from "@/services/user.service"
import departmentService, { type Department } from "@/services/department.service"
import positionService, { type Position } from "@/services/position.service"
import openUserFormDialog from "./components/UserFormDialog"
import UserListToolbar from "./components/UserListToolbar"
import UserListTable from "./components/UserListTable"

export default function UserList() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchUsers = async () => {
    try {
      const [userRes, deptRes, posRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        positionService.getAll(),
      ])

      setUsers(userRes.data.data)
      setDepartments(deptRes.data.data)
      setPositions(posRes.data.data)
    } catch {
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const deptNameMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name] as const)),
    [departments]
  )
  const posNameMap = useMemo(
    () => new Map(positions.map((p) => [p.id, p.name] as const)),
    [positions]
  )

  const visibleUsers = useMemo(() => {
    if (currentUser?.role === "admin") return users
    if (currentUser?.position === "manager" && currentUser.departmentId) {
      return users.filter((u) => u.departmentId === currentUser.departmentId)
    }
    return users
  }, [currentUser, users])

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
        departments,
        positions,
        onSubmit: async (payload) => {
          if (editingUser) {
            await userService.update(editingUser.id, payload)
          } else {
            await userService.create(payload)
          }
        },
      })
      if (!result || !result.changed) return
      toast.success(editingUser ? "Cập nhật thành công" : "Tạo mới thành công")
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu thất bại")
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
      await userService.delete(user.id)
      toast.success("Xoá thành công")
      fetchUsers()
    } catch {
      toast.error("Xoá thất bại")
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
      await userService.update(user.id, {
        status: nextStatus,
        leaveDate: nextStatus ? undefined : todayKey,
      })
      toast.success(nextStatus ? "Kích hoạt thành công" : "Đã vô hiệu người dùng")
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại")
    }
  }

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
