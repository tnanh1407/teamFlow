import { z } from "zod";
import { ETaskRole } from "../../enums/project-role.enum.js";

export const createProjectEmployeeSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  role: z.enum(Object.values(ETaskRole) as [string, ...string[]]).default(ETaskRole.MEMBER),
});

export const updateProjectEmployeeSchema = createProjectEmployeeSchema.partial();
