import { z } from "zod";
import { EUserRole } from "../enums/user-role.enum.js";

export const createUserSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(Object.values(EUserRole)).default(EUserRole.USER),
  status: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial();

export const updateMeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
