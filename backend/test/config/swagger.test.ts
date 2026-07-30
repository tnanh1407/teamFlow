import { describe, it, expect } from "vitest";

describe("swagger config", () => {
  it("should generate swagger spec with correct title and version", async () => {
    const { swaggerSpec } = await import("../../src/config/swagger.js");
    expect(swaggerSpec.info.title).toBe("TeamFlow API");
    expect(swaggerSpec.info.version).toBe("1.0.0");
    expect(swaggerSpec.openapi).toBe("3.1.0");
  });

  it("should define security schemes", async () => {
    const { swaggerSpec } = await import("../../src/config/swagger.js");
    expect(swaggerSpec.components.securitySchemes).toHaveProperty("cookieAuth");
    expect(swaggerSpec.components.securitySchemes).toHaveProperty("bearerAuth");
  });

  it("should define User schema", async () => {
    const { swaggerSpec } = await import("../../src/config/swagger.js");
    expect(swaggerSpec.components.schemas).toHaveProperty("User");
    expect(swaggerSpec.components.schemas.User.properties).toHaveProperty("id");
    expect(swaggerSpec.components.schemas.User.properties).toHaveProperty("name");
    expect(swaggerSpec.components.schemas.User.properties).toHaveProperty("email");
    expect(swaggerSpec.components.schemas.User.properties).toHaveProperty("role");
  });

  it("should define API paths", async () => {
    const { swaggerSpec } = await import("../../src/config/swagger.js");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/login");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/logout");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/all");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/department/{departmentId}");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/position/{positionId}");
    expect(swaggerSpec.paths).toHaveProperty("/api/users");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/{id}");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/updatePs");
    expect(swaggerSpec.paths).toHaveProperty("/api/users/me/avatar");
  });
});
