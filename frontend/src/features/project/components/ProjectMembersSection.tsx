import { useState } from "react"
import { Users, Plus, Building2, X } from "lucide-react"
import type { ProjectMember } from "@/services/project-member.service"
import type { Department } from "@/services/department.service"
import type { User } from "@/services/user.service"

interface ProjectMembersSectionProps {
  projectMembers: (ProjectMember & { user?: User })[]
  departments: Department[]
  canManageMembers: boolean
  isManager: boolean
  canEdit: boolean
  userDeptId: string | null
  onOpenAddModal: () => void
  onRemoveMember: (id: string) => void
}

export default function ProjectMembersSection({
  projectMembers,
  departments,
  canManageMembers,
  isManager,
  canEdit,
  userDeptId,
  onOpenAddModal,
  onRemoveMember,
}: ProjectMembersSectionProps) {
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({})

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Users size={16} className="text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Thành viên</h2>
        <span className="ml-auto text-xs text-zinc-400">{projectMembers.length} người</span>
        {canManageMembers && (
          <button
            onClick={onOpenAddModal}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer border-none"
            title="Thêm thành viên"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      {projectMembers.length === 0 ? (
        <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có thành viên</p>
      ) : (
        departments.map((dept) => {
          const deptMems = projectMembers.filter((pm) => pm.user?.departmentId === dept.id)
          if (deptMems.length === 0) return null
          const open = expandedDepts[dept.id] ?? true
          return (
            <div key={dept.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
              <button
                onClick={() => setExpandedDepts((prev) => ({ ...prev, [dept.id]: !open }))}
                className="w-full flex items-center gap-2 px-5 py-2.5 text-left transition cursor-pointer border-none bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className={`text-xs text-zinc-400 transition ${open ? "rotate-90" : ""}`}>▸</span>
                <Building2 size={13} className="text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  {dept.name}
                </span>
                <span className="text-[10px] text-zinc-400">({deptMems.length})</span>
              </button>
              {open && (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {deptMems.map((pm) => {
                    const canRemoveThisMember = canEdit || (isManager && pm.user?.departmentId === userDeptId)
                    return (
                      <div key={pm.id} className="px-5 py-2 flex items-center gap-3 pl-10">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {pm.user?.avatarURL ? (
                            <img src={pm.user.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{pm.user?.name?.slice(0, 2).toUpperCase() || "??"}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {pm.user?.name || "—"}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">{pm.user?.employeeCode}</p>
                        </div>
                        {canRemoveThisMember && (
                          <button
                            onClick={() => onRemoveMember(pm.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer border-none shrink-0"
                            title="Xoá khỏi dự án"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
