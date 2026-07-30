import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
