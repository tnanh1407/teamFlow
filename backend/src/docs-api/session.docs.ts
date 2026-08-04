export const sessionSchemas = {
  Session: {
    type: "object",
    example: {
      id: "a0000000-0000-4000-a000-000000000001",
      userId: "30000000-0000-4000-a000-000000000001",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0",
      ip: "127.0.0.1",
      expiresAt: "2026-08-05T08:30:00.000Z",
      revokedAt: null,
      createdAt: "2026-08-04T08:30:00.000Z",
      isCurrent: true,
    },
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string", format: "uuid" },
      userAgent: { type: "string", nullable: true },
      ip: { type: "string", nullable: true },
      expiresAt: { type: "string", format: "date-time" },
      revokedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      isCurrent: { type: "boolean", description: "Phiên của yêu cầu hiện tại" },
    },
  },
};

export const sessionPaths = {
  "/api/sessions/me": {
    get: {
      tags: ["Sessions"],
      description: "Lấy danh sách các phiên đăng nhập đang còn hiệu lực của tài khoản hiện tại, bao gồm thiết bị, IP, thời điểm hết hạn và đánh dấu phiên nào là phiên hiện tại.",
      summary: "Danh sách phiên đăng nhập của tôi",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Danh sách phiên đang hoạt động",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Session" } },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Sessions"],
      summary: "Đăng xuất tất cả thiết bị khác",
      description: "Thu hồi mọi phiên khác của tài khoản hiện tại, giữ lại phiên đang dùng.",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Đã thu hồi toàn bộ phiên khác" } },
    },
  },
  "/api/sessions/{id}": {
    delete: {
      tags: ["Sessions"],
      summary: "Thu hồi một phiên đăng nhập từ xa",
      description: "Dùng để vô hiệu hoá một phiên cụ thể theo ID phiên.",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "a0000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: { description: "Thu hồi phiên thành công" },
        404: { description: "Không tìm thấy phiên" },
      },
    },
  },
};
