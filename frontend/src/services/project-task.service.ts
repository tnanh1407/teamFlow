import api from "@/lib/axios"

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description: string
  status: string
  priority: string
  assignedTo: string | null
  assignedBy: string | null
  assignedAt: string | null
  dueDate: string | null
  createdBy: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

const projectTaskService = {
  getAll: async () => {
    const { data } = await api.get<{ data: ProjectTask[] }>("/project-tasks")
    return { data: { data: data.data } }
  },
}

export default projectTaskService
