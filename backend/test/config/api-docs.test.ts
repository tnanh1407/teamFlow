import { describe, it, expect } from "vitest";

describe("api docs spec", () => {
  it("should export spec with correct title and version", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.info.title).toBe("TeamFlow API");
    expect(apiSpec.info.version).toBe("1.0.0");
    expect(apiSpec.openapi).toBe("3.1.0");
  });

  it("should define security schemes", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.components.securitySchemes).toHaveProperty("cookieAuth");
    expect(apiSpec.components.securitySchemes).toHaveProperty("bearerAuth");
  });

  it("should define User schema", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.components.schemas).toHaveProperty("User");
    expect(apiSpec.components.schemas.User.properties).toHaveProperty("id");
    expect(apiSpec.components.schemas.User.properties).toHaveProperty("name");
    expect(apiSpec.components.schemas.User.properties).toHaveProperty("email");
    expect(apiSpec.components.schemas.User.properties).toHaveProperty("role");
  });

  it("should define Department schema", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.components.schemas).toHaveProperty("Department");
    expect(apiSpec.components.schemas.Department.properties).toHaveProperty("id");
    expect(apiSpec.components.schemas.Department.properties).toHaveProperty("name");
    expect(apiSpec.components.schemas.Department.properties).toHaveProperty("code");
  });

  it("should define Position schema", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.components.schemas).toHaveProperty("Position");
    expect(apiSpec.components.schemas.Position.properties).toHaveProperty("id");
    expect(apiSpec.components.schemas.Position.properties).toHaveProperty("name");
    expect(apiSpec.components.schemas.Position.properties).toHaveProperty("level");
  });

  it("should define API paths", async () => {
    const { apiSpec } = await import("../../src/docs-api/index.js");
    expect(apiSpec.paths).toHaveProperty("/api/users/login");
    expect(apiSpec.paths).toHaveProperty("/api/users/logout");
    expect(apiSpec.paths).toHaveProperty("/api/users/all");
    expect(apiSpec.paths).toHaveProperty("/api/users/department/{departmentId}");
    expect(apiSpec.paths).toHaveProperty("/api/users/position/{positionId}");
    expect(apiSpec.paths).toHaveProperty("/api/users");
    expect(apiSpec.paths).toHaveProperty("/api/users/{id}");
    expect(apiSpec.paths).toHaveProperty("/api/users/updatePs");
    expect(apiSpec.paths).toHaveProperty("/api/users/me/avatar");
    expect(apiSpec.paths).toHaveProperty("/api/departments");
    expect(apiSpec.paths).toHaveProperty("/api/departments/{id}");
    expect(apiSpec.paths).toHaveProperty("/api/positions");
    expect(apiSpec.paths).toHaveProperty("/api/positions/{id}");
  });
});
