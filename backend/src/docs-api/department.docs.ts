export const departmentSchemas = {
  Department: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      code: { type: "string" },
      description: { type: "string", nullable: true },
      managerId: { type: "string", format: "uuid", nullable: true },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  DepartmentInput: {
    type: "object",
    required: ["name", "code"],
    properties: {
      name: { type: "string" },
      code: { type: "string" },
      description: { type: "string" },
      managerId: { type: "string", format: "uuid" },
      isActive: { type: "boolean", default: true },
    },
  },
  PaginatedDepartments: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Department" },
      },
    },
  },
};

export const departmentPaths = {
  "/api/departments": {
    get: {
      tags: ["Departments"],
      summary: "Lấy danh sách phòng ban (phân trang)",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Danh sách phòng ban", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedDepartments" } } } } },
    },
    post: {
      tags: ["Departments"],
      summary: "Tạo phòng ban mới",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/DepartmentInput" } } } },
      responses: {
        201: { description: "Tạo thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Department" } } } } } },
      },
    },
  },
  "/api/departments/{id}": {
    get: {
      tags: ["Departments"],
      summary: "Lấy phòng ban theo ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Thông tin phòng ban", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Department" } } } } } },
        404: { description: "Không tìm thấy" },
      },
    },
    patch: {
      tags: ["Departments"],
      summary: "Cập nhật phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/DepartmentInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
    delete: {
      tags: ["Departments"],
      summary: "Xoá phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Xoá thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
  },
};
