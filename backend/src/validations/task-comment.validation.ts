import { z } from "zod";

export const createTaskCommentSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  content: z.string().optional(),
  attachments: z.string().optional(),
});

export const updateTaskCommentSchema = createTaskCommentSchema.partial();
