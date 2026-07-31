export const searchSchemas = {
  SearchResults: {
    type: "object",
    properties: {
      users: { type: "array", items: { $ref: "#/components/schemas/User" } },
      projects: { type: "array", items: { $ref: "#/components/schemas/Project" } },
      tasks: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } },
      departments: { type: "array", items: { $ref: "#/components/schemas/Department" } },
      positions: { type: "array", items: { $ref: "#/components/schemas/Position" } },
    },
  },
};

export const searchPaths = {
  "/api/search": {
    get: {
      tags: ["Search"],
      summary: "Tìm kiếm nhanh toàn hệ thống (Ctrl+K)",
      description:
        "Tìm kiếm gộp trong một lần gọi: nhân viên, dự án, task, phòng ban, chức vụ — mỗi nhóm tối đa 5 kết quả. " +
        "Nhân viên thường chỉ nhận kết quả thuộc phạm vi của mình (dự án/task được phân công, người tạo hoặc cùng phòng ban); phòng ban/chức vụ chỉ trả về cho Admin. " +
        "Tìm không phân biệt hoa thường, hỗ trợ ký tự `%`/`_` như wildcard.",
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1 }, description: "Từ khoá tìm kiếm" },
        { name: "limit", in: "query", schema: { type: "integer", default: 5, maximum: 10 }, description: "Số kết quả tối đa mỗi nhóm" },
      ],
      responses: {
        200: {
          description: "Kết quả tìm kiếm theo nhóm",
          content: { "application/json": { schema: { $ref: "#/components/schemas/SearchResults" } } },
        },
      },
    },
  },
};
