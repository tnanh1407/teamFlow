import { z } from "zod";

export const createProjectDepartmentSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
});
