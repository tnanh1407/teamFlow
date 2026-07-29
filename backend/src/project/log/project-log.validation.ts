import { z } from "zod";
import { ETaskAction } from "../../enums/project-action.enum.js";

export const createProjectLogSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  action: z.enum(Object.values(ETaskAction) as [string, ...string[]]).optional(),
  description: z.string().optional(),
});
