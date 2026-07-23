import { z } from "zod";
import { ETaskAction } from "../enums/task-action.enum.js";

export const createTaskLogSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  action: z.enum(Object.values(ETaskAction) as [string, ...string[]]).optional(),
  description: z.string().optional(),
});

export const updateTaskLogSchema = createTaskLogSchema.partial();
