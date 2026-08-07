import { z } from "zod";
import { ELevel } from "../enums/level.enum.js";

export const createPositionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.enum(Object.values(ELevel) as [string, ...string[]]).optional(),
  isActive: z.boolean().optional(),
});

export const updatePositionSchema = createPositionSchema.partial();
