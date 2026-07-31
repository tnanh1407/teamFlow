export const sessionSchemas = {
  Session: {
    type: "object",
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
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Đã thu hồi toàn bộ phiên khác" } },
    },
  },
  "/api/sessions/{id}": {
    delete: {
      tags: ["Sessions"],
      summary: "Thu hồi một phiên đăng nhập từ xa",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Thu hồi phiên thành công" },
        404: { description: "Không tìm thấy phiên" },
      },
    },
  },
};
