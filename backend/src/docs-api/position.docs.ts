export const positionSchemas = {
  Position: {
    type: "object",
    example: {
      id: "20000000-0000-4000-a000-000000000005",
      name: "Nhân viên",
      description: "Nhân viên - vị trí thực thi công việc chuyên môn",
      level: "Junior",
      isActive: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      level: { type: "string", enum: ["Intern", "Junior", "Middle", "Senior", "Leader", "Manager"], nullable: true },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  PositionInput: {
    type: "object",
    required: ["name"],
    example: {
      name: "Senior Developer",
      description: "Phụ trách phát triển, review code và định hướng kỹ thuật",
      level: "Senior",
      isActive: true,
    },
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      level: { type: "string", enum: ["Intern", "Junior", "Middle", "Senior", "Leader", "Manager"] },
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
          description: "Nhân viên - vị trí thực thi công việc chuyên môn",
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
      description: "Trả về danh sách chức vụ/cấp bậc đang được cấu hình trong hệ thống theo dạng phân trang. Endpoint này hỗ trợ các màn hình quản trị danh mục chức vụ và các form gán vị trí công việc cho nhân viên.",
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
      description: "Tạo mới một chức vụ trong hệ thống. Có thể khai báo tên, mô tả, level và trạng thái hoạt động. Endpoint này thường chỉ dành cho quản trị viên để bổ sung các cấp bậc nhân sự khi cơ cấu tổ chức thay đổi.",
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
                  name: "Senior Developer",
                  description: "Phụ trách phát triển, review code và định hướng kỹ thuật",
                  level: "Senior",
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
      description: "Lấy chi tiết một chức vụ theo ID để hiển thị thông tin đầy đủ trước khi sửa, hoặc để dùng ở các màn hình tra cứu nhân sự và mapping chức danh.",
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
                  description: "Nhân viên - vị trí thực thi công việc chuyên môn",
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
      description: "Cập nhật một chức vụ hiện có theo ID. Dùng để đổi tên chức vụ, chỉnh mô tả, thay đổi level hoặc bật/tắt trạng thái hoạt động khi danh mục chức vụ cần được làm sạch.",
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
                  description: "Nhân viên - vị trí thực thi công việc chuyên môn",
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
      description: "Xoá một chức vụ khỏi hệ thống theo ID. Chỉ nên thực hiện khi chắc chắn chức vụ đó không còn được tham chiếu trong dữ liệu nhân sự hoặc quy trình nghiệp vụ.",
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
