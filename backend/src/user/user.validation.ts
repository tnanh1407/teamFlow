import { z } from "zod";
import { EGender } from "../enums/gender.enum.js";

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

function addEmploymentDateIssues(
  data: { birthDate?: string; hireDate?: string; leaveDate?: string },
  ctx: z.RefinementCtx,
) {
  const birthDate = data.birthDate ? parseDateOnly(data.birthDate) : null;
  const hireDate = data.hireDate ? parseDateOnly(data.hireDate) : null;
  const leaveDate = data.leaveDate ? parseDateOnly(data.leaveDate) : null;

  if (data.birthDate && !birthDate) ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Birth date is invalid" });
  if (data.hireDate && !hireDate) ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Hire date is invalid" });
  if (data.leaveDate && !leaveDate) ctx.addIssue({ code: "custom", path: ["leaveDate"], message: "Leave date is invalid" });

  if (birthDate && hireDate) {
    const minimumHireDate = new Date(birthDate);
    minimumHireDate.setUTCFullYear(minimumHireDate.getUTCFullYear() + 18);
    if (hireDate < birthDate) {
      ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Hire date cannot be before birth date" });
    } else if (hireDate < minimumHireDate) {
      ctx.addIssue({ code: "custom", path: ["hireDate"], message: "Employee must be at least 18 years old on hire date" });
    }
  }

  if (hireDate && leaveDate && leaveDate < hireDate) {
    ctx.addIssue({ code: "custom", path: ["leaveDate"], message: "Leave date cannot be before hire date" });
  }
}

export const createUserSchema = z.object({
  departmentId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  employeeCode: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  leaveDate: z.string().optional(),
  gender: z.enum(Object.values(EGender) as [string, ...string[]]).default(EGender.OTHER),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatarURL: z.string().optional(),
}).superRefine(addEmploymentDateIssues);

export const updateUserSchema = z.object({
  departmentId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  employeeCode: z.string().nullable().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  leaveDate: z.string().optional(),
  gender: z.enum(Object.values(EGender) as [string, ...string[]]).optional(),
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  status: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  avatarURL: z.string().optional(),
  avatarAction: z.enum(["remove"]).optional(),
}).superRefine(addEmploymentDateIssues);

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
