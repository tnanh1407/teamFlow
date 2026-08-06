import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Pencil, Trash2, ArrowUpDown, Building2, FileText, Copy } from "lucide-react"
import departmentService, { type Department } from "@/services/department.service"
import { MySwal, showDeleteConfirm, showErrorAlert, showSuccessAlert } from "@/lib/swal"
import TableStateRow from "@/shared/ui/TableStateRow"
import PageSeo from "@/shared/ui/PageSeo"
import PageHeader from "@/shared/ui/PageHeader"

export default function Departments() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.getAll()
      setDepartments(data.data)
    } catch {
      console.error("Failed to fetch departments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0
    const cmp = a.name.localeCompare(b.name)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))
  }

  const openCreate = () => {
    openFormDialog()
  }

  const openEdit = (e: React.MouseEvent, department: Department) => {
    e.stopPropagation()
    openFormDialog(department)
  }

  const inputClass =
    "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1"

  const openFormDialog = async (editingDept?: Department) => {
    const isEdit = !!editingDept
    const dataRef: { current: { code: string; name: string; description: string; isActive: boolean } | null } = { current: null }

    function FormComponent() {
      const [f, setF] = useState(
        isEdit
          ? { code: editingDept!.code, name: editingDept!.name, description: editingDept!.description, isActive: editingDept!.isActive }
          : { code: "", name: "", description: "", isActive: true }
      )
      dataRef.current = f
      return (
        <div className="space-y-3" style={{ textAlign: "left" }}>
          <div>
            <label className={labelClass}>Mã phòng ban</label>
            <input type="text" value={f.code} onChange={(e) => setF((p) => ({ ...p, code: e.target.value }))} placeholder="VD: IT, HR, SALES" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tên phòng ban</label>
            <input type="text" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} placeholder="Nhập tên phòng ban" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả phòng ban (không bắt buộc)" rows={3} className={inputClass + " resize-none"} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="swal-status" checked={f.isActive} onChange={(e) => setF((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="swal-status" className="text-sm text-zinc-700 cursor-pointer">Kích hoạt</label>
          </div>
        </div>
      )
    }

    const result = await MySwal.fire({
      title: isEdit ? "Sửa phòng ban" : "Thêm phòng ban",
      width: 420,
      html: <FormComponent />,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Tạo mới",
      cancelButtonText: "Huỷ",
      reverseButtons: true,
      preConfirm: () => {
        const d = dataRef.current
        if (!d) return false
        if (!d.code.trim()) { MySwal.showValidationMessage("Vui lòng nhập mã phòng ban"); return false }
        if (!d.name.trim()) { MySwal.showValidationMessage("Vui lòng nhập tên phòng ban"); return false }
        return d
      },
    })

    if (result.isConfirmed && result.value) {
      try {
        if (isEdit) {
          await departmentService.update(editingDept!.id, result.value)
          void showSuccessAlert("Cập nhật thành công")
        } else {
          await departmentService.create(result.value)
          void showSuccessAlert("Tạo mới thành công")
        }
        fetchDepartments()
      } catch {
        void showErrorAlert("Lưu thất bại")
      }
    }
  }

  const confirmDelete = async (e: React.MouseEvent, department: Department) => {
    e.stopPropagation()
    const confirmed = await showDeleteConfirm({
      name: department.name,
      html: `Bạn có chắc muốn xoá phòng ban <strong>${department.name}</strong>? Hành động này không thể hoàn tác.`,
    })
    if (confirmed) {
      try {
        await departmentService.delete(department.id)
        void showSuccessAlert("Xoá thành công")
        fetchDepartments()
      } catch {
        void showErrorAlert("Xoá thất bại")
      }
    }
  }

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <PageSeo
        title="Quản lí phòng ban"
        description="Thống kê tổng quan toàn bộ thông số trong hệ thống TeamFlow"
      />
      <PageHeader title="Quản lí phòng ban" desc="Thống kê tổng quan toàn bộ thông số trong hệ thống" />

      {/* Search & Actions */}
      <div className="flex items-center justify-between rounded-2xl px-6 py-2 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 hover:shadow-sm transition-all cursor-pointer border-none"
            title="Thêm phòng ban"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={toggleSort}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer border-none hover:bg-white dark:hover:bg-zinc-800"
            title={
              sortDir === null ? "Sắp xếp A-Z" : sortDir === "asc" ? "Sắp xếp Z-A" : "Bỏ sắp xếp"
            }
          >
            <ArrowUpDown
              size={16}
              className={`transition-all duration-200 ${sortDir === "desc" ? "rotate-180" : ""
                } ${sortDir ? "text-blue-500" : "text-zinc-400"}`}
            />
            {sortDir && (
              <span className="text-zinc-600 dark:text-zinc-300">
                {sortDir === "asc" ? "A-Z" : "Z-A"}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mã Định Danh
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mã CODE
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tên phòng ban
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <TableStateRow colSpan={5} loading title="Đang tải..." />
              ) : sorted.length === 0 ? (
                <TableStateRow colSpan={5} title="Không tìm thấy phòng ban nào" />
              ) : (
                sorted.map((department) => (
                  <tr
                    key={department.id}
                    onClick={() => navigate(`/departments/${department.id}`)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                        {department.id}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(department.id)
                            void showSuccessAlert("Đã sao chép UUID")
                          }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy UUID"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                        {department.code}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(department.code)
                            void showSuccessAlert("Đã sao chép mã")
                          }}
                          className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
                          title="Copy"
                        >
                          <Copy size={12} />
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-zinc-400 shrink-0" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {department.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="shrink-0" />
                        <span>{department.description || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => openEdit(e, department)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer border-none"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => confirmDelete(e, department)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer border-none"
                          title="Xoá"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
