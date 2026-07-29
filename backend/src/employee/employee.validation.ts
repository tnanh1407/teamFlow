import { z } from "zod";
import { EGender } from "../enums/gender.enum.js";

export const createEmployeeSchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  positionId: z.string().min(1, "Position ID is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
  gender: z.enum(Object.values(EGender) as [string, ...string[]]).default(EGender.OTHER),
  status: z.boolean().default(true),
  avatarURL: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
