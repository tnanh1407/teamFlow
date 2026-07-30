export const positionSchemas = {
  Position: {
    type: "object",
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
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      level: { type: "string", enum: ["Intern", "Junior", "Middle", "Senior", "Leader", "Manager"] },
      isActive: { type: "boolean" },
    },
  },
  PaginatedPositions: {
    type: "object",
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
      summary: "Lấy danh sách chức vụ",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Danh sách chức vụ", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedPositions" } } } } },
    },
    post: {
      tags: ["Positions"],
      summary: "Tạo chức vụ mới",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/PositionInput" } } } },
      responses: {
        201: { description: "Tạo thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Position" } } } } } },
      },
    },
  },
  "/api/positions/{id}": {
    get: {
      tags: ["Positions"],
      summary: "Lấy chức vụ theo ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Thông tin chức vụ", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Position" } } } } } },
        404: { description: "Không tìm thấy" },
      },
    },
    patch: {
      tags: ["Positions"],
      summary: "Cập nhật chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/PositionInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
    delete: {
      tags: ["Positions"],
      summary: "Xoá chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Xoá thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
  },
};
