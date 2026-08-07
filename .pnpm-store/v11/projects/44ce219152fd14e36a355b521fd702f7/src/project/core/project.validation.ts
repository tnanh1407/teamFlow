import { z } from "zod";
import { EPriority } from "../../enums/priority.enum.js";
import { EProjectStatus } from "../../enums/project-status.enum.js";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  avatar: z.string().optional(),
  priority: z.enum(Object.values(EPriority) as [string, ...string[]]).default(EPriority.MEDIUM),
  status: z.enum(Object.values(EProjectStatus) as [string, ...string[]]).default(EProjectStatus.TODO),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  assignedBy: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
