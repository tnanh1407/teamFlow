export const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid" },
      positionId: { type: "string", format: "uuid" },
      employeeCode: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string", nullable: true },
      birthDate: { type: "string", format: "date", nullable: true },
      hireDate: { type: "string", format: "date", nullable: true },
      gender: { type: "string", enum: ["male", "female", "other"] },
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
  UserInput: {
    type: "object",
    required: ["departmentId", "positionId", "employeeCode", "name", "email", "username", "password"],
    properties: {
      departmentId: { type: "string", description: "Department UUID" },
      positionId: { type: "string", description: "Position UUID" },
      employeeCode: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      birthDate: { type: "string", format: "date" },
      hireDate: { type: "string", format: "date" },
      gender: { type: "string", enum: ["male", "female", "other"], default: "other" },
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
          user: { $ref: "#/components/schemas/User" },
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
  PaginatedUsers: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/User" },
      },
    },
  },
};

export const userPaths = {
  "/api/users/login": {
    post: {
      tags: ["Users"],
      summary: "Đăng nhập",
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } } },
      responses: {
        200: { description: "Đăng nhập thành công", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
        401: { description: "Sai thông tin đăng nhập", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        403: { description: "Tài khoản bị vô hiệu hoá", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },
  "/api/users/logout": {
    post: {
      tags: ["Users"],
      summary: "Đăng xuất",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Đăng xuất thành công" } },
    },
  },
  "/api/users/all": {
    get: {
      tags: ["Users"],
      summary: "Lấy tất cả nhân viên",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Danh sách tất cả nhân viên", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedUsers" } } } } },
    },
  },
  "/api/users/department/{departmentId}": {
    get: {
      tags: ["Users"],
      summary: "Lấy người dùng theo phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "departmentId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Danh sách người dùng trong phòng ban", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedUsers" } } } } },
    },
  },
  "/api/users/position/{positionId}": {
    get: {
      tags: ["Users"],
      summary: "Lấy người dùng theo chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "positionId", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Danh sách người dùng theo chức vụ", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedUsers" } } } } },
    },
  },
  "/api/users": {
    get: {
      tags: ["Users"],
      summary: "Lấy danh sách người dùng (phân trang)",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Danh sách người dùng phân trang", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedUsers" } } } } },
    },
    post: {
      tags: ["Users"],
      summary: "Tạo người dùng mới",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } } },
      responses: {
        201: { description: "Tạo thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } },
        409: { description: "Username đã tồn tại" },
      },
    },
  },
  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Lấy người dùng theo ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Thông tin người dùng", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } },
        404: { description: "Không tìm thấy" },
      },
    },
    patch: {
      tags: ["Users"],
      summary: "Cập nhật người dùng (admin/manager)",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Vô hiệu hoá người dùng",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Vô hiệu hoá thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
  },
  "/api/users/updatePs": {
    patch: {
      tags: ["Users"],
      summary: "Đổi mật khẩu cá nhân",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMeInput" } } } },
      responses: { 200: { description: "Đổi mật khẩu thành công" } },
    },
  },
  "/api/users/me/avatar": {
    post: {
      tags: ["Users"],
      summary: "Cập nhật avatar",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } } } } },
      responses: { 200: { description: "Cập nhật avatar thành công" } },
    },
  },
};
