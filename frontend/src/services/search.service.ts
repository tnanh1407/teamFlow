import api from "@/lib/axios";
import type { Project } from "./project.service";
import type { Department } from "./department.service";
import type { Position } from "./position.service";

export interface SearchUser {
  id: string;
  name: string;
  username: string;
  email: string;
  employeeCode: string | null;
  avatarURL?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResults {
  users: SearchUser[];
  projects: Project[];
  tasks: ProjectTask[];
  departments: Department[];
  positions: Position[];
}

const searchService = {
  async searchAll(q: string, limit = 5): Promise<SearchResults> {
    const { data } = await api.get<SearchResults>("/search", {
      params: { q, limit },
    });
    return data;
  },
};

export default searchService;
