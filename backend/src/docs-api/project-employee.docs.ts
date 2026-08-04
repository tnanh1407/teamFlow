export const projectEmployeeSchemas = {
  ProjectEmployee: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      role: { type: "string", enum: ["leader", "member", "reviewer"] },
      assignedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectEmployeeInput: {
    type: "object",
    required: ["projectId", "employeeId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      role: { type: "string", enum: ["leader", "member", "reviewer"], default: "member" },
    },
  },
  ProjectRoleInput: {
    type: "object",
    required: ["role"],
    properties: {
      role: { type: "string", enum: ["leader", "member", "reviewer"] },
    },
  },
};

const peAuth = { security: [{ cookieAuth: [] }] };

const peIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const projectEmployeePaths = {
  "/api/project-employees": {
    get: {
      tags: ["Project Employees"],
      summary: "Lấy danh sách phân công nhân viên",
      description: "Chỉ Admin hoặc Manager xem được toàn bộ danh sách.",
      ...peAuth,
      responses: {
        200: { description: "Danh sách phân công", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectEmployee" } } } } } } },
        403: { description: "Không đủ quyền (chỉ Admin/Manager)" },
      },
    },
    post: {
      tags: ["Project Employees"],
      summary: "Thêm nhân viên vào dự án",
      description: "Chỉ Admin hoặc Manager được thêm nhân viên.",
      ...peAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectEmployeeInput" } } } },
      responses: {
        201: { description: "Phân công thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectEmployee" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin/Manager)" },
      },
    },
  },
  "/api/project-employees/employee/{employeeId}": {
    get: {
      tags: ["Project Employees"],
      description: "Lấy toàn bộ các phân công dự án của một nhân viên cụ thể. Endpoint này hữu ích khi xem hồ sơ nhân sự, đánh giá khối lượng công việc hoặc hiển thị danh sách dự án mà nhân viên đó đang tham gia.",
      summary: "Lấy phân công theo nhân viên",
      ...peAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách dự án của nhân viên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectEmployee" } } } } } } },
      },
    },
  },
  "/api/project-employees/{id}": {
    get: {
      tags: ["Project Employees"],
      description: "Lấy chi tiết một bản ghi phân công theo ID để xem nhân viên nào đang giữ vai trò gì trong dự án nào, phục vụ màn hình quản trị phân công và kiểm tra lịch sử gán việc.",
      summary: "Xem chi tiết phân công",
      ...peAuth,
      parameters: [peIdParam],
      responses: {
        200: { description: "Thông tin phân công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectEmployee" } } } } } },
        404: { description: "Không tìm thấy" },
      },
    },
    patch: {
      tags: ["Project Employees"],
      summary: "Cập nhật vai trò trong dự án",
      description: "Chỉ Admin hoặc Manager được đổi vai trò.",
      ...peAuth,
      parameters: [peIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectRoleInput" } } } },
      responses: {
        200: { description: "Cập nhật vai trò thành công" },
        403: { description: "Không đủ quyền (chỉ Admin/Manager)" },
      },
    },
    delete: {
      tags: ["Project Employees"],
      summary: "Xoá nhân viên khỏi dự án",
      description: "Admin hoặc User (chính người đó) được xoá khỏi dự án.",
      ...peAuth,
      parameters: [peIdParam],
      responses: {
        200: { description: "Xoá phân công thành công" },
      },
    },
  },
};
