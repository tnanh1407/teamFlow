import { z } from "zod";
import { EProjectAction } from "../enums/project-action.enum.js";

export const createProjectLogSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  action: z.enum(Object.values(EProjectAction) as [string, ...string[]]).optional(),
  description: z.string().optional(),
});

export const updateProjectLogSchema = createProjectLogSchema.partial();
