import { z } from "zod";

const notificationTypes = ["announcement", "reminder", "update"] as const;
const notificationPriorities = ["low", "medium", "high", "critical"] as const;

const projectNotificationBaseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  type: z.enum(notificationTypes).default("announcement"),
  priority: z.enum(notificationPriorities).default("medium"),
  isPinned: z.boolean().default(false),
});

export const createProjectNotificationSchema = projectNotificationBaseSchema;

export const updateProjectNotificationSchema = projectNotificationBaseSchema
  .omit({ projectId: true })
  .partial();

