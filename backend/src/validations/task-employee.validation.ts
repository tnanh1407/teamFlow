import { z } from "zod";
import { ETaskRole } from "../enums/task-role.enum.js";

export const createTaskEmployeeSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  role: z.enum(Object.values(ETaskRole) as [string, ...string[]]).default(ETaskRole.MEMBER),
});

export const updateTaskEmployeeSchema = createTaskEmployeeSchema.partial();
