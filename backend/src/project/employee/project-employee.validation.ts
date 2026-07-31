import { z } from "zod";
import { EProjectRole } from "../../enums/project-role.enum.js";

export const createProjectEmployeeSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  role: z.enum(Object.values(EProjectRole) as [string, ...string[]]).default(EProjectRole.MEMBER),
});

export const updateProjectEmployeeSchema = z.object({
  role: z.enum(Object.values(EProjectRole) as [string, ...string[]]),
});
