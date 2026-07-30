import { userSchemas, userPaths } from "./user.docs.js";
import { departmentSchemas, departmentPaths } from "./department.docs.js";
import { positionSchemas, positionPaths } from "./position.docs.js";

export const apiSpec = {
  openapi: "3.1.0",
  info: {
    title: "TeamFlow API",
    version: "1.0.0",
    description: "API quản lý công việc nội bộ TeamFlow",
  },
  servers: [{ url: "http://localhost:5000", description: "Local dev" }],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ...userSchemas,
      ...departmentSchemas,
      ...positionSchemas,
    },
  },
  paths: {
    ...userPaths,
    ...departmentPaths,
    ...positionPaths,
  },
};
