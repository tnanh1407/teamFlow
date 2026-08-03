import { Building2, Plus, X } from "lucide-react"
import type { Department } from "@/services/department.service"

interface ProjectDepartmentsSectionProps {
  departments: Department[]
  deptUserCount: Record<string, number>
  canEdit: boolean
  onOpenAddModal: () => void
  onRemoveDepartment: (departmentId: string) => void
}

export default function ProjectDepartmentsSection({
  departments,
  deptUserCount,
  canEdit,
  onOpenAddModal,
  onRemoveDepartment,
}: ProjectDepartmentsSectionProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Building2 size={16} className="text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Phòng ban</h2>
        {canEdit && (
          <button
            onClick={onOpenAddModal}
            className="ml-auto w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer border-none"
            title="Thêm phòng ban"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {departments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có phòng ban</p>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="px-5 py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{dept.name}</p>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 text-[10px] font-medium">
                    {deptUserCount[dept.id] ?? 0} người
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{dept.code}</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => onRemoveDepartment(dept.id)}
                  className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer border-none shrink-0"
                  title="Xoá phòng ban"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
