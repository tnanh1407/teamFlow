export const projectDepartmentSchemas = {
  ProjectDepartment: {
    type: "object",
    properties: {
      projectId: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid" },
      assignedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectDepartmentInput: {
    type: "object",
    required: ["projectId", "departmentId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid" },
    },
  },
};

const pdAuth = { security: [{ cookieAuth: [] }] };

export const projectDepartmentPaths = {
  "/api/project-departments": {
    get: {
      tags: ["Project Departments"],
      description: "Lấy danh sách các phòng ban đang được gắn với dự án. Dùng cho màn hình cấu hình phạm vi tham gia của dự án hoặc để kiểm tra phòng ban nào đang liên quan đến một dự án cụ thể.",
      summary: "Lấy danh sách phòng ban tham gia dự án",
      ...pdAuth,
      responses: {
        200: { description: "Danh sách phòng ban trong dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectDepartment" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
    post: {
      tags: ["Project Departments"],
      description: "Gắn một phòng ban vào dự án. Endpoint này thường dùng khi mở rộng phạm vi phối hợp của dự án sang các phòng ban khác trong công ty.",
      summary: "Gắn phòng ban vào dự án",
      ...pdAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectDepartmentInput" } } } },
      responses: {
        201: { description: "Gắn phòng ban thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectDepartment" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
    delete: {
      tags: ["Project Departments"],
      summary: "Gỡ phòng ban khỏi dự án",
      description: "Gỡ một phòng ban ra khỏi dự án bằng cặp projectId và departmentId. Thích hợp khi phòng ban không còn tham gia hoặc được chuyển sang dự án khác.",
      ...pdAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectDepartmentInput" } } } },
      responses: {
        200: { description: "Gỡ phòng ban khỏi dự án thành công" },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/project-departments/project/{projectId}": {
    get: {
      tags: ["Project Departments"],
      description: "Lấy toàn bộ phòng ban đang tham gia một dự án cụ thể để phục vụ phần chi tiết dự án, bảng phân công liên phòng ban và các báo cáo phối hợp công việc.",
      summary: "Danh sách phòng ban của một dự án",
      ...pdAuth,
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách phòng ban của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectDepartment" } } } } } } },
      },
    },
  },
};
