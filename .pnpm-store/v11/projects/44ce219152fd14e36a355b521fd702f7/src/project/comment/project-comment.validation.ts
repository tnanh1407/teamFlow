import { z } from "zod";

const projectCommentBaseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  content: z.string().optional(),
  attachments: z.string().optional(),
});

export const createProjectCommentSchema = projectCommentBaseSchema.refine((data) => {
  const hasContent = Boolean(data.content?.trim());
  const hasAttachments = Boolean(data.attachments?.trim());
  return hasContent || hasAttachments;
}, {
  message: "Comment must have content or attachments",
  path: ["content"],
});

export const updateProjectCommentSchema = projectCommentBaseSchema.partial();
