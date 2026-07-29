import { z } from "zod";
import { EAccountPosition } from "../enums/account-role.enum.js";

export const createAccountSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.enum([EAccountPosition.MANAGER, EAccountPosition.MEMBER]).default(EAccountPosition.MEMBER),
});

export const updateAccountSchema = z.object({
  employeeId: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  position: z.enum([EAccountPosition.MANAGER, EAccountPosition.MEMBER]).optional(),
  status: z.boolean().optional(),
});

export const updateMeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
