export const positionSchemas = {
  Position: {
    type: "object",
    example: {
      id: "20000000-0000-4000-a000-000000000005",
      name: "Nhân viên",
      description: "Nhân viên chính thức thực thi công việc chuyên môn",
      level: "Junior",
      isActive: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      level: { type: "string", enum: ["Manager", "Junior", "Intern"], nullable: true },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  PositionInput: {
    type: "object",
    required: ["name"],
    example: {
      name: "Nhân viên",
      description: "Nhân viên chính thức thực thi công việc chuyên môn",
      level: "Junior",
      isActive: true,
    },
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      level: { type: "string", enum: ["Manager", "Junior", "Intern"] },
      isActive: { type: "boolean" },
    },
  },
  PaginatedPositions: {
    type: "object",
    example: {
      data: [
        {
          id: "20000000-0000-4000-a000-000000000005",
          name: "Nhân viên",
          description: "Nhân viên chính thức thực thi công việc chuyên môn",
          level: "Junior",
          isActive: true,
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Position" },
      },
    },
  },
};

export const positionPaths = {
  "/api/positions": {
    get: {
      tags: ["Positions"],
      description: "Trả về danh sách 3 chức vụ hệ thống: Quản lí, Nhân viên và Thực tập sinh. Đây là danh mục cố định được dùng để gán cho nhân viên thông qua `positionId`.",
      summary: "Danh sách chức vụ",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Danh sách chức vụ",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedPositions" },
              example: {
                data: [
                  {
                    id: "20000000-0000-4000-a000-000000000005",
                    name: "Nhân viên",
                    description: "Nhân viên - vị trí thực thi công việc chuyên môn",
                    level: "Junior",
                    isActive: true,
                    createdAt: "2025-01-01T00:00:00.000Z",
                    updatedAt: "2025-01-01T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Positions"],
      description: "Tạo hoặc khôi phục một trong 3 chức vụ hệ thống. Backend chỉ chấp nhận đúng 3 giá trị cố định: Quản lí, Nhân viên và Thực tập sinh. Không hỗ trợ tạo chức vụ tuỳ ý.",
      summary: "Tạo chức vụ",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/PositionInput" } } } },
      responses: {
        201: {
          description: "Tạo thành công",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Position" } } },
              example: {
                data: {
                  id: "20000000-0000-4000-a000-000000000010",
                  name: "Nhân viên",
                  description: "Nhân viên chính thức thực thi công việc chuyên môn",
                  level: "Junior",
                  isActive: true,
                  createdAt: "2026-08-04T08:30:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/positions/{id}": {
    get: {
      tags: ["Positions"],
      description: "Lấy chi tiết một trong 3 chức vụ hệ thống theo ID để hiển thị thông tin đầy đủ trước khi sửa, hoặc dùng để map nhân sự theo `positionId`.",
      summary: "Chi tiết chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "20000000-0000-4000-a000-000000000005" } }],
      responses: {
        200: {
          description: "Thông tin chức vụ",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Position" } } },
              example: {
                data: {
                  id: "20000000-0000-4000-a000-000000000005",
                  name: "Nhân viên",
                  description: "Nhân viên chính thức thực thi công việc chuyên môn",
                  level: "Junior",
                  isActive: true,
                  createdAt: "2025-01-01T00:00:00.000Z",
                  updatedAt: "2025-01-01T00:00:00.000Z",
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy",
          content: { "application/json": { example: { message: "Không tìm thấy" } } },
        },
      },
    },
    patch: {
      tags: ["Positions"],
      description: "Cập nhật mô tả hoặc trạng thái hoạt động của một trong 3 chức vụ hệ thống. Backend không cho đổi tên hay đổi mã chức vụ để đảm bảo bảng positions luôn chỉ có 3 giá trị cố định.",
      summary: "Cập nhật chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "20000000-0000-4000-a000-000000000005" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/PositionInput" } } } },
      responses: {
        200: {
          description: "Cập nhật thành công",
          content: {
            "application/json": {
              example: {
                data: {
                  id: "20000000-0000-4000-a000-000000000005",
                  name: "Nhân viên",
                  description: "Nhân viên chính thức thực thi công việc chuyên môn",
                  level: "Junior",
                  isActive: true,
                  createdAt: "2025-01-01T00:00:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy",
          content: { "application/json": { example: { message: "Không tìm thấy" } } },
        },
      },
    },
    delete: {
      tags: ["Positions"],
      description: "Xoá một chức vụ khỏi hệ thống theo ID. Các chức vụ hệ thống cố định như Quản lí, Nhân viên, Thực tập sinh sẽ bị backend từ chối xoá.",
      summary: "Xoá chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "20000000-0000-4000-a000-000000000005" } }],
      responses: {
        200: {
          description: "Xoá thành công",
          content: {
            "application/json": {
              example: {
                message: "Xoá thành công",
              },
            },
          },
        },
        404: { description: "Không tìm thấy" },
      },
    },
  },
};
