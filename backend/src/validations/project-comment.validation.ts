import { z } from "zod";

export const createProjectCommentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  content: z.string().optional(),
  attachments: z.string().optional(),
});

export const updateProjectCommentSchema = createProjectCommentSchema.partial();
