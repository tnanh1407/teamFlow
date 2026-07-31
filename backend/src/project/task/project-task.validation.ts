import { z } from "zod";
import { EProjectTaskStatus } from "../../enums/project-task-status.enum.js";
import { EPriority } from "../../enums/priority.enum.js";

export const createProjectTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(Object.values(EProjectTaskStatus) as [string, ...string[]]).optional(),
  priority: z.enum(Object.values(EPriority) as [string, ...string[]]).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateProjectTaskSchema = createProjectTaskSchema.partial();
