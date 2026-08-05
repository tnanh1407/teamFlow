const notificationAuth = { security: [{ cookieAuth: [] }] };
const adminAuth = { security: [{ cookieAuth: [] }] };

const notificationIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid", example: "91000000-0000-4000-a000-000000000001" },
};

export const systemNotificationSchemas = {
  SystemNotification: {
    type: "object",
    example: {
      id: "91000000-0000-4000-a000-000000000001",
      createdBy: "30000000-0000-4000-a000-000000000001",
      source: "admin",
      title: "Bảo trì hệ thống tối nay",
      content: "Hệ thống sẽ tạm ngưng truy cập từ 22:00 đến 23:00 để nâng cấp bảo mật.",
      type: "announcement",
      priority: "high",
      targetAudience: "all",
      isPinned: true,
      createdAt: "2026-08-05T08:00:00.000Z",
      updatedAt: "2026-08-05T08:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      createdBy: { type: "string", format: "uuid", nullable: true },
      source: { type: "string", enum: ["admin", "system"] },
      title: { type: "string" },
      content: { type: "string" },
      type: { type: "string", enum: ["announcement", "reminder", "update"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      targetAudience: { type: "string", enum: ["all", "user", "manager", "staff", "intern", "admin"] },
      isPinned: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  SystemNotificationInput: {
    type: "object",
    required: ["title", "content"],
    example: {
      title: "Nhắc cập nhật thông tin cá nhân",
      content: "Toàn bộ nhân sự vui lòng kiểm tra lại email và số điện thoại trước cuối tuần.",
      type: "reminder",
      priority: "medium",
      targetAudience: "all",
      isPinned: false,
    },
    properties: {
      title: { type: "string", description: "Tiêu đề thông báo" },
      content: { type: "string", description: "Nội dung thông báo" },
      type: { type: "string", enum: ["announcement", "reminder", "update"], default: "announcement" },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"], default: "medium" },
      targetAudience: { type: "string", enum: ["all", "user", "manager", "staff", "intern", "admin"], default: "all" },
      isPinned: { type: "boolean", default: false },
    },
  },
};

export const systemNotificationPaths = {
  "/api/system-notifications": {
    get: {
      tags: ["System Notifications"],
      summary: "Danh sách thông báo phù hợp với người dùng hiện tại",
      description:
        "Trả về danh sách thông báo toàn hệ thống mà tài khoản đang đăng nhập có quyền nhìn thấy. Admin sẽ thấy toàn bộ, còn user chỉ thấy thông báo áp dụng cho nhóm của mình.",
      ...notificationAuth,
      responses: {
        200: {
          description: "Danh sách thông báo",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/SystemNotification" } } } },
            },
          },
        },
      },
    },
    post: {
      tags: ["System Notifications"],
      summary: "Tạo thông báo hệ thống",
      description: "Chỉ admin được phép tạo thông báo mới cho toàn hệ thống hoặc theo nhóm người nhận cụ thể.",
      ...adminAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/SystemNotificationInput" } } } },
      responses: {
        201: {
          description: "Tạo thông báo thành công",
          content: { "application/json": { example: { data: { id: "91000000-0000-4000-a000-000000000001" } } } },
        },
        403: {
          description: "Không đủ quyền",
          content: { "application/json": { example: { message: "Only admin can manage system notifications" } } },
        },
      },
    },
  },
  "/api/system-notifications/manage": {
    get: {
      tags: ["System Notifications"],
      summary: "Danh sách toàn bộ thông báo hệ thống",
      description: "Danh sách dành cho trang quản trị. Chỉ admin được phép xem toàn bộ thông báo, kể cả thông báo không hiển thị với user khác.",
      ...adminAuth,
      responses: {
        200: {
          description: "Danh sách toàn bộ thông báo",
        },
      },
    },
  },
  "/api/system-notifications/{id}": {
    get: {
      tags: ["System Notifications"],
      summary: "Chi tiết thông báo hệ thống",
      description: "Lấy chi tiết một thông báo nếu tài khoản hiện tại được phép xem.",
      ...notificationAuth,
      parameters: [notificationIdParam],
      responses: {
        200: {
          description: "Thông tin thông báo",
          content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/SystemNotification" } } } } },
        },
      },
    },
    patch: {
      tags: ["System Notifications"],
      summary: "Cập nhật thông báo hệ thống",
      description: "Chỉ admin được phép chỉnh sửa nội dung, độ ưu tiên, nhóm nhận hoặc trạng thái ghim.",
      ...adminAuth,
      parameters: [notificationIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/SystemNotificationInput" } } } },
      responses: {
        200: {
          description: "Cập nhật thành công",
          content: { "application/json": { example: { message: "Notification updated successfully" } } },
        },
      },
    },
    delete: {
      tags: ["System Notifications"],
      summary: "Xoá thông báo hệ thống",
      description: "Chỉ admin được phép xoá thông báo khỏi hệ thống.",
      ...adminAuth,
      parameters: [notificationIdParam],
      responses: {
        200: {
          description: "Xoá thành công",
          content: { "application/json": { example: { message: "Notification deleted successfully" } } },
        },
      },
    },
  },
};
