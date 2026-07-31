export const projectLogSchemas = {
  ProjectLog: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      action: { type: "string", enum: ["created", "updated", "assigned", "commented", "completed", "cancelled"] },
      description: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  ProjectLogInput: {
    type: "object",
    required: ["projectId", "employeeId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      action: { type: "string", enum: ["created", "updated", "assigned", "commented", "completed", "cancelled"] },
      description: { type: "string" },
    },
  },
};

const logAuth = { security: [{ cookieAuth: [] }] };

const logIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const projectLogPaths = {
  "/api/project-logs": {
    get: {
      tags: ["Project Logs"],
      summary: "Lấy danh sách nhật ký hoạt động",
      description: "Chỉ Admin mới xem được nhật ký hoạt động của hệ thống.",
      ...logAuth,
      responses: {
        200: { description: "Danh sách nhật ký", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectLog" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
    post: {
      tags: ["Project Logs"],
      summary: "Ghi nhật ký hoạt động",
      description: "Nhật ký thường được ghi tự động khi có thay đổi dự án/task.",
      ...logAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectLogInput" } } } },
      responses: {
        201: { description: "Ghi nhật ký thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectLog" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
      },
    },
  },
  "/api/project-logs/project/{projectId}": {
    get: {
      tags: ["Project Logs"],
      summary: "Lấy nhật ký theo dự án",
      ...logAuth,
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách nhật ký của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectLog" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-logs/employee/{employeeId}": {
    get: {
      tags: ["Project Logs"],
      summary: "Lấy nhật ký theo nhân viên",
      ...logAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách nhật ký của nhân viên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectLog" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-logs/{id}": {
    get: {
      tags: ["Project Logs"],
      summary: "Xem chi tiết nhật ký",
      ...logAuth,
      parameters: [logIdParam],
      responses: {
        200: { description: "Thông tin nhật ký", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectLog" } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
        404: { description: "Không tìm thấy nhật ký" },
      },
    },
  },
};
