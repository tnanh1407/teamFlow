import { z } from "zod";

export const createProjectDepartmentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
});
