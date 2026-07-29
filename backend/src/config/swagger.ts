import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
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
        Account: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            username: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            position: { type: "string", nullable: true, enum: ["member", "manager", null] },
            status: { type: "boolean" },
            avatarURL: { type: "string", nullable: true },
            lastLogin: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AccountInput: {
          type: "object",
          required: ["employeeId", "username", "password"],
          properties: {
            employeeId: { type: "string", description: "Employee UUID" },
            username: { type: "string" },
            password: { type: "string", minLength: 6 },
            position: { type: "string", enum: ["member", "manager"], default: "member" },
            status: { type: "boolean", default: true },
          },
        },
        LoginInput: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/Account" },
                token: { type: "string" },
              },
            },
          },
        },
        UpdateMeInput: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        PaginatedAccounts: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Account" },
            },
          },
        },
      },
    },
    paths: {
      "/api/accounts/login": {
        post: {
          tags: ["Accounts"],
          summary: "Đăng nhập",
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } } },
          responses: {
            200: { description: "Đăng nhập thành công", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
            401: { description: "Sai thông tin đăng nhập", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Tài khoản bị vô hiệu hoá", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/accounts/logout": {
        post: {
          tags: ["Accounts"],
          summary: "Đăng xuất",
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Đăng xuất thành công" } },
        },
      },
      "/api/accounts": {
        get: {
          tags: ["Accounts"],
          summary: "Lấy danh sách tài khoản",
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Danh sách tài khoản", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedAccounts" } } } } },
        },
        post: {
          tags: ["Accounts"],
          summary: "Tạo tài khoản mới",
          security: [{ cookieAuth: [] }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AccountInput" } } } },
          responses: {
            201: { description: "Tạo thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Account" } } } } } },
            409: { description: "Username đã tồn tại" },
          },
        },
      },
      "/api/accounts/{id}": {
        get: {
          tags: ["Accounts"],
          summary: "Lấy tài khoản theo ID",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Thông tin tài khoản", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Account" } } } } } },
            404: { description: "Không tìm thấy" },
          },
        },
        patch: {
          tags: ["Accounts"],
          summary: "Cập nhật tài khoản",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AccountInput" } } } },
          responses: {
            200: { description: "Cập nhật thành công" },
            404: { description: "Không tìm thấy" },
          },
        },
        delete: {
          tags: ["Accounts"],
          summary: "Vô hiệu hoá tài khoản",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Vô hiệu hoá thành công" },
            404: { description: "Không tìm thấy" },
          },
        },
      },
      "/api/accounts/me": {
        patch: {
          tags: ["Accounts"],
          summary: "Đổi mật khẩu cá nhân",
          security: [{ cookieAuth: [] }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMeInput" } } } },
          responses: { 200: { description: "Đổi mật khẩu thành công" } },
        },
      },
      "/api/accounts/me/avatar": {
        post: {
          tags: ["Accounts"],
          summary: "Cập nhật avatar",
          security: [{ cookieAuth: [] }],
          requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Cập nhật avatar thành công" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
