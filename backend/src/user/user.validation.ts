import { z } from "zod";
import { EAccountPosition } from "../enums/account-role.enum.js";
import { EGender } from "../enums/gender.enum.js";

export const createUserSchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  positionId: z.string().min(1, "Position ID is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  gender: z.enum(Object.values(EGender) as [string, ...string[]]).default(EGender.OTHER),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.enum([EAccountPosition.MANAGER, EAccountPosition.MEMBER]).default(EAccountPosition.MEMBER),
  avatarURL: z.string().optional(),
});

export const updateUserSchema = z.object({
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  employeeCode: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  gender: z.enum(Object.values(EGender) as [string, ...string[]]).optional(),
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  position: z.enum([EAccountPosition.MANAGER, EAccountPosition.MEMBER]).optional(),
  status: z.boolean().optional(),
  avatarURL: z.string().optional(),
});

export const updatePassword = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
  employeeCode: z.string().min(1, "Employee code is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
