export const projectTaskSchemas = {
  ProjectTask: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      assignedTo: { type: "string", format: "uuid", nullable: true, description: "Nhân viên được giao task" },
      assignedBy: { type: "string", format: "uuid", nullable: true },
      assignedAt: { type: "string", format: "date-time", nullable: true },
      dueDate: { type: "string", format: "date", nullable: true },
      createdBy: { type: "string", format: "uuid", nullable: true },
      completedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectTaskInput: {
    type: "object",
    required: ["projectId", "title"],
    properties: {
      projectId: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string" },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      assignedTo: { type: "string", format: "uuid" },
      dueDate: { type: "string", format: "date" },
    },
  },
};

const taskAuth = { security: [{ cookieAuth: [] }] };

const taskIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const projectTaskPaths = {
  "/api/project-tasks": {
    get: {
      tags: ["Project Tasks"],
      description: "Trả về toàn bộ task trong hệ thống mà người dùng có quyền xem. Endpoint này phù hợp cho màn hình tổng quan công việc, bộ lọc admin và các view theo dõi trạng thái công việc trên nhiều dự án.",
      summary: "Lấy danh sách tất cả task",
      ...taskAuth,
      responses: {
        200: { description: "Danh sách task", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } } } } },
      },
    },
    post: {
      tags: ["Project Tasks"],
      summary: "Tạo/giao task mới",
      description: "Chỉ Manager được tạo/giao task (Admin chỉ xem, không tạo).",
      ...taskAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectTaskInput" } } } },
      responses: {
        201: { description: "Tạo task thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectTask" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Manager)" },
      },
    },
  },
  "/api/project-tasks/project/{projectId}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy danh sách task thuộc một dự án cụ thể, đồng thời hỗ trợ lọc theo trạng thái, nhân viên được giao và từ khoá tìm kiếm. Đây là endpoint chính cho màn hình chi tiết dự án và bảng công việc của dự án.",
      summary: "Lấy task theo dự án (lọc/tìm kiếm)",
      ...taskAuth,
      parameters: [
        { name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        { name: "q", in: "query", schema: { type: "string" }, description: "Tìm theo tiêu đề hoặc mô tả" },
        { name: "status", in: "query", schema: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] } },
        { name: "assignedTo", in: "query", schema: { type: "string", format: "uuid" }, description: "Lọc theo nhân viên được giao" },
      ],
      responses: {
        200: { description: "Danh sách task của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } } } } },
      },
    },
  },
  "/api/project-tasks/employee/{id}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy toàn bộ task được giao cho một nhân viên cụ thể để phục vụ hồ sơ cá nhân, màn hình công việc của tôi hoặc báo cáo tải công việc theo người.",
      summary: "Lấy task được giao cho một nhân viên",
      ...taskAuth,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách task của nhân viên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } } } } },
      },
    },
  },
  "/api/project-tasks/{id}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy thông tin chi tiết của một task theo ID, bao gồm tiêu đề, mô tả, trạng thái, độ ưu tiên, người được giao và các mốc thời gian liên quan. Dùng cho màn hình chi tiết và form chỉnh sửa task.",
      summary: "Xem chi tiết task",
      ...taskAuth,
      parameters: [taskIdParam],
      responses: {
        200: { description: "Thông tin task", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectTask" } } } } } },
        404: { description: "Không tìm thấy task" },
      },
    },
    patch: {
      tags: ["Project Tasks"],
      summary: "Cập nhật task (trạng thái, giao việc...)",
      description: "Manager hoặc chính nhân viên được giao (assignee) mới được cập nhật.",
      ...taskAuth,
      parameters: [taskIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectTaskInput" } } } },
      responses: {
        200: { description: "Cập nhật task thành công" },
        403: { description: "Không đủ quyền (chỉ Manager hoặc assignee)" },
        404: { description: "Không tìm thấy task" },
      },
    },
    delete: {
      tags: ["Project Tasks"],
      description: "Xoá một task khỏi hệ thống theo ID. Thao tác này thường chỉ dành cho Manager và nên thực hiện khi task được tạo nhầm hoặc không còn hợp lệ.",
      summary: "Xoá task",
      ...taskAuth,
      parameters: [taskIdParam],
      responses: {
        200: { description: "Xoá task thành công" },
        403: { description: "Không đủ quyền (chỉ Manager)" },
      },
    },
  },
};
