const notificationAuth = { security: [{ cookieAuth: [] }] };

const notificationIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid", example: "90000000-0000-4000-a000-000000000001" },
};

export const projectNotificationSchemas = {
  ProjectNotification: {
    type: "object",
    example: {
      id: "90000000-0000-4000-a000-000000000001",
      projectId: "50000000-0000-4000-a000-000000000004",
      createdBy: "30000000-0000-4000-a000-000000000008",
      title: "Tổ chức họp kick-off",
      content: "Toàn bộ thành viên dự án tham gia họp lúc 9:00 sáng thứ Hai để chốt phạm vi và tiến độ.",
      type: "announcement",
      priority: "high",
      isPinned: true,
      createdAt: "2026-08-05T08:00:00.000Z",
      updatedAt: "2026-08-05T08:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      createdBy: { type: "string", format: "uuid" },
      title: { type: "string" },
      content: { type: "string" },
      type: { type: "string", enum: ["announcement", "reminder", "update"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      isPinned: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectNotificationInput: {
    type: "object",
    required: ["projectId", "title", "content"],
    example: {
      projectId: "50000000-0000-4000-a000-000000000004",
      title: "Nhắc deadline tuần này",
      content: "Đề nghị toàn bộ thành viên hoàn thành phần việc trước 17:00 thứ Sáu.",
      type: "reminder",
      priority: "medium",
      isPinned: false,
    },
    properties: {
      projectId: { type: "string", format: "uuid", description: "ID dự án" },
      title: { type: "string", description: "Tiêu đề thông báo" },
      content: { type: "string", description: "Nội dung thông báo" },
      type: { type: "string", enum: ["announcement", "reminder", "update"], default: "announcement" },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"], default: "medium" },
      isPinned: { type: "boolean", default: false },
    },
  },
};

export const projectNotificationPaths = {
  "/api/project-notifications/project/{projectId}": {
    get: {
      tags: ["Project Notifications"],
      summary: "Danh sách thông báo của dự án",
      description:
        "Trả về toàn bộ thông báo gắn với một dự án cụ thể. Leader của project là người có thể tạo nội dung chung cho toàn team; các thành viên còn lại chỉ xem.",
      ...notificationAuth,
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid", example: "50000000-0000-4000-a000-000000000004" },
        },
      ],
      responses: {
        200: {
          description: "Danh sách thông báo của dự án",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectNotification" } } } },
              example: {
                data: [
                  {
                    id: "90000000-0000-4000-a000-000000000001",
                    projectId: "50000000-0000-4000-a000-000000000004",
                    createdBy: "30000000-0000-4000-a000-000000000008",
                    title: "Tổ chức họp kick-off",
                    content: "Toàn bộ thành viên dự án tham gia họp lúc 9:00 sáng thứ Hai để chốt phạm vi và tiến độ.",
                    type: "announcement",
                    priority: "high",
                    isPinned: true,
                    createdAt: "2026-08-05T08:00:00.000Z",
                    updatedAt: "2026-08-05T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/project-notifications/{id}": {
    get: {
      tags: ["Project Notifications"],
      summary: "Chi tiết thông báo",
      description: "Lấy chi tiết một thông báo theo ID để hiển thị hoặc phục vụ chỉnh sửa.",
      ...notificationAuth,
      parameters: [notificationIdParam],
      responses: {
        200: {
          description: "Thông tin thông báo",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectNotification" } } },
            },
          },
        },
      },
    },
    patch: {
      tags: ["Project Notifications"],
      summary: "Cập nhật thông báo",
      description: "Chỉ leader của project mới được cập nhật nội dung hoặc ghim/tháo ghim thông báo.",
      ...notificationAuth,
      parameters: [notificationIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectNotificationInput" } } } },
      responses: {
        200: {
          description: "Cập nhật thông báo thành công",
          content: { "application/json": { example: { message: "Notification updated successfully" } } },
        },
      },
    },
    delete: {
      tags: ["Project Notifications"],
      summary: "Xóa thông báo",
      description: "Xóa một thông báo dự án không còn cần thiết.",
      ...notificationAuth,
      parameters: [notificationIdParam],
      responses: {
        200: {
          description: "Xóa thông báo thành công",
          content: { "application/json": { example: { message: "Notification deleted successfully" } } },
        },
      },
    },
  },
  "/api/project-notifications": {
    post: {
      tags: ["Project Notifications"],
      summary: "Tạo thông báo",
      description: "Tạo một thông báo chung cho toàn bộ thành viên dự án. Chỉ leader của project được phép thao tác.",
      ...notificationAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectNotificationInput" } } } },
      responses: {
        201: {
          description: "Tạo thông báo thành công",
          content: { "application/json": { example: { data: { id: "90000000-0000-4000-a000-000000000001" } } } },
        },
        403: {
          description: "Không đủ quyền",
          content: { "application/json": { example: { message: "Only project leader can manage notifications" } } },
        },
      },
    },
  },
};
