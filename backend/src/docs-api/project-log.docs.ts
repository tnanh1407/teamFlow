export const projectLogSchemas = {
  ProjectLog: {
    type: "object",
    example: {
      id: "80000000-0000-4000-a000-000000000001",
      projectId: "50000000-0000-4000-a000-000000000001",
      employeeId: "30000000-0000-4000-a000-000000000001",
      action: "created",
      description: "Dự án được tạo bởi Nguyễn Văn Anh",
      createdAt: "2025-06-01T00:00:00.000Z",
    },
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
    example: {
      projectId: "50000000-0000-4000-a000-000000000001",
      employeeId: "30000000-0000-4000-a000-000000000001",
      action: "updated",
      description: "Cập nhật tiến độ dự án lên 60%",
    },
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
      description: "Lấy toàn bộ nhật ký liên quan đến một dự án theo ID. Dùng để audit lịch sử thay đổi, xem ai đã tạo/cập nhật/hoàn thành/cancel dự án và phục vụ màn hình lịch sử hoạt động của dự án.",
      summary: "Lấy nhật ký theo dự án",
      ...logAuth,
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "50000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: { description: "Danh sách nhật ký của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectLog" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-logs/employee/{employeeId}": {
    get: {
      tags: ["Project Logs"],
      description: "Lấy nhật ký hoạt động gắn với một nhân viên cụ thể để xem người đó đã tạo, cập nhật, được giao hay tương tác với dự án/task nào trong hệ thống.",
      summary: "Lấy nhật ký theo nhân viên",
      ...logAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: { description: "Danh sách nhật ký của nhân viên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectLog" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-logs/{id}": {
    get: {
      tags: ["Project Logs"],
      description: "Xem chi tiết một bản ghi nhật ký theo ID, bao gồm hành động, mô tả, dự án liên quan, nhân viên thực hiện và thời điểm phát sinh.",
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
