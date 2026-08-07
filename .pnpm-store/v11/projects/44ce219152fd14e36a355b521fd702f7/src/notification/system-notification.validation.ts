import { z } from "zod";

const notificationTypes = ["announcement", "reminder", "update"] as const;
const notificationPriorities = ["low", "medium", "high", "critical"] as const;
const notificationAudiences = ["all", "user", "manager", "staff", "intern", "admin"] as const;

const systemNotificationBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  type: z.enum(notificationTypes).default("announcement"),
  priority: z.enum(notificationPriorities).default("medium"),
  targetAudience: z.enum(notificationAudiences).default("all"),
  isPinned: z.boolean().default(false),
});

export const createSystemNotificationSchema = systemNotificationBaseSchema;

export const updateSystemNotificationSchema = systemNotificationBaseSchema.partial();

