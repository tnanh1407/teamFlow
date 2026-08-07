import "dotenv/config";
import { z } from "zod";

const useMock = process.env.USE_MOCK_DB === "true";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().optional().default(5000),
  DATABASE_URL: useMock ? z.string().optional().default("") : z.string(),
  JWT_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional().default(587),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  APP_URL: z.string().url().optional().default("http://localhost:5173"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
