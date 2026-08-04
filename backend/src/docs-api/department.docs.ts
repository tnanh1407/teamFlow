export const departmentSchemas = {
  Department: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      code: { type: "string" },
      description: { type: "string", nullable: true },
      managerId: { type: "string", format: "uuid", nullable: true },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  DepartmentInput: {
    type: "object",
    required: ["name", "code"],
    properties: {
      name: { type: "string" },
      code: { type: "string" },
      description: { type: "string" },
      managerId: { type: "string", format: "uuid" },
      isActive: { type: "boolean", default: true },
    },
  },
  PaginatedDepartments: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Department" },
      },
    },
  },
};

export const departmentPaths = {
  "/api/departments": {
    get: {
      tags: ["Departments"],
      description: "Trả về danh sách phòng ban đang tồn tại trong hệ thống theo dạng phân trang. Endpoint này thường dùng cho màn hình quản trị danh mục phòng ban, bộ lọc khi tạo/cập nhật nhân viên và các màn hình cần chọn phòng ban theo danh sách.",
      summary: "Lấy danh sách phòng ban (phân trang)",
      security: [{ cookieAuth: [] }],
      responses: { 200: { description: "Danh sách phòng ban", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedDepartments" } } } } },
    },
    post: {
      tags: ["Departments"],
      description: "Tạo mới một phòng ban trong hệ thống. Yêu cầu có ít nhất tên và mã phòng ban; các thông tin như mô tả, trưởng phòng và trạng thái hoạt động là tùy chọn. Thường chỉ Admin có quyền sử dụng endpoint này để mở rộng cơ cấu tổ chức.",
      summary: "Tạo phòng ban mới",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/DepartmentInput" } } } },
      responses: {
        201: { description: "Tạo thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Department" } } } } } },
      },
    },
  },
  "/api/departments/{id}": {
    get: {
      tags: ["Departments"],
      description: "Lấy đầy đủ thông tin của một phòng ban theo ID. Dùng khi cần xem chi tiết phòng ban, kiểm tra mô tả, trưởng phòng, trạng thái hoạt động hoặc hiển thị dữ liệu trước khi chỉnh sửa.",
      summary: "Lấy phòng ban theo ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Thông tin phòng ban", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Department" } } } } } },
        404: { description: "Không tìm thấy" },
      },
    },
    patch: {
      tags: ["Departments"],
      description: "Cập nhật thông tin phòng ban theo ID. Có thể chỉnh tên, mã, mô tả, trưởng phòng và trạng thái hoạt động. Endpoint này phù hợp cho màn hình quản trị danh mục hoặc thao tác sửa trực tiếp từ chi tiết phòng ban.",
      summary: "Cập nhật phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/DepartmentInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
    delete: {
      tags: ["Departments"],
      description: "Xoá một phòng ban khỏi hệ thống theo ID. Nên chỉ dùng khi phòng ban không còn được sử dụng hoặc đã được chuyển dữ liệu sang phòng ban khác để tránh làm hỏng quan hệ nhân sự/dự án.",
      summary: "Xoá phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Xoá thành công" },
        404: { description: "Không tìm thấy" },
      },
    },
  },
};
