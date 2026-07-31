export const projectDepartmentSchemas = {
  ProjectDepartment: {
    type: "object",
    properties: {
      projectId: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid" },
      assignedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectDepartmentInput: {
    type: "object",
    required: ["projectId", "departmentId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid" },
    },
  },
};

const pdAuth = { security: [{ cookieAuth: [] }] };

export const projectDepartmentPaths = {
  "/api/project-departments": {
    get: {
      tags: ["Project Departments"],
      summary: "Lấy danh sách phòng ban tham gia dự án",
      description: "Chỉ Admin xem được toàn bộ danh sách.",
      ...pdAuth,
      responses: {
        200: { description: "Danh sách phòng ban trong dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectDepartment" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
    post: {
      tags: ["Project Departments"],
      summary: "Gắn phòng ban vào dự án",
      ...pdAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectDepartmentInput" } } } },
      responses: {
        201: { description: "Gắn phòng ban thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectDepartment" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
    delete: {
      tags: ["Project Departments"],
      summary: "Gỡ phòng ban khỏi dự án",
      description: "Nhận body giống POST (projectId + departmentId) để xác định cặp cần gỡ.",
      ...pdAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectDepartmentInput" } } } },
      responses: {
        200: { description: "Gỡ phòng ban khỏi dự án thành công" },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-departments/project/{projectId}": {
    get: {
      tags: ["Project Departments"],
      summary: "Danh sách phòng ban của một dự án",
      ...pdAuth,
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách phòng ban của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectDepartment" } } } } } } },
      },
    },
  },
};
