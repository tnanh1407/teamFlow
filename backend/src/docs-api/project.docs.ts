export const projectSchemas = {
  Project: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      avatarURL: { type: "string", nullable: true, description: "URL ảnh đại diện trên Cloudinary" },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] },
      progress: { type: "number", minimum: 0, maximum: 100 },
      startDate: { type: "string", format: "date", nullable: true },
      dueDate: { type: "string", format: "date", nullable: true },
      assignedBy: { type: "string", format: "uuid", nullable: true },
      createdBy: { type: "string", format: "uuid" },
      estimatedHours: { type: "number", nullable: true },
      actualHours: { type: "number", nullable: true },
      completedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectInput: {
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"], default: "medium" },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"], default: "todo" },
      progress: { type: "number", minimum: 0, maximum: 100, default: 0 },
      startDate: { type: "string", format: "date" },
      dueDate: { type: "string", format: "date" },
      assignedBy: { type: "string", format: "uuid" },
      estimatedHours: { type: "number" },
      actualHours: { type: "number" },
    },
  },
  PaginatedProjects: {
    type: "object",
    properties: {
      data: { type: "array", items: { $ref: "#/components/schemas/Project" } },
      total: { type: "integer" },
      page: { type: "integer" },
      limit: { type: "integer" },
      totalPages: { type: "integer" },
    },
  },
};

const projectAuth = { security: [{ cookieAuth: [] }] };

const projectIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const projectPaths = {
  "/api/projects": {
    get: {
      tags: ["Projects"],
      summary: "Lấy danh sách dự án (phân trang + lọc/tìm kiếm)",
      description:
        "Admin xem được toàn bộ dự án; nhân viên thường chỉ thấy dự án của mình (phân công, người tạo hoặc cùng phòng ban). " +
        "Hỗ trợ tìm kiếm theo tiêu đề/mô tả (?q) và lọc theo trạng thái/độ ưu tiên; admin có thể tự giới hạn về dự án của mình với ?mine=true.",
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
        { name: "q", in: "query", schema: { type: "string" }, description: "Tìm theo tiêu đề hoặc mô tả (không phân biệt hoa thường)" },
        { name: "status", in: "query", schema: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] } },
        { name: "priority", in: "query", schema: { type: "string", enum: ["low", "medium", "high", "critical"] } },
        { name: "mine", in: "query", schema: { type: "boolean" }, description: "Chỉ lấy dự án của tôi (áp dụng cho admin)" },
      ],
      responses: {
        200: { description: "Danh sách dự án phân trang", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedProjects" } } } },
      },
    },
    post: {
      tags: ["Projects"],
      summary: "Tạo dự án mới",
      description: "Chỉ Admin được tạo dự án. Người tạo được ghi nhận tự động từ token.",
      ...projectAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } } },
      responses: {
        201: { description: "Tạo dự án thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Project" } } } } } },
        400: { description: "Dữ liệu không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/projects/me": {
    get: {
      tags: ["Projects"],
      summary: "Lấy danh sách dự án của tôi",
      description: "Trả về các dự án mà nhân viên hiện tại được phân công hoặc đã tạo.",
      ...projectAuth,
      responses: {
        200: { description: "Danh sách dự án của tôi", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } } },
      },
    },
  },
  "/api/projects/status/{status}": {
    get: {
      tags: ["Projects"],
      summary: "Lọc dự án theo trạng thái",
      description: "Admin xem được toàn bộ; nhân viên thường chỉ thấy dự án của mình.",
      ...projectAuth,
      parameters: [{ name: "status", in: "path", required: true, schema: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] } }],
      responses: {
        200: { description: "Danh sách dự án theo trạng thái", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } } },
      },
    },
  },
  "/api/projects/priority/{priority}": {
    get: {
      tags: ["Projects"],
      description: "Lọc danh sách dự án theo mức độ ưu tiên để ưu tiên hiển thị các công việc quan trọng trước. Hữu ích cho dashboard, báo cáo và các màn hình theo dõi tiến độ tập trung vào độ gấp của dự án.",
      summary: "Lọc dự án theo độ ưu tiên",
      ...projectAuth,
      parameters: [{ name: "priority", in: "path", required: true, schema: { type: "string", enum: ["low", "medium", "high", "critical"] } }],
      responses: {
        200: { description: "Danh sách dự án theo độ ưu tiên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } } },
      },
    },
  },
  "/api/projects/created-by/{employeeId}": {
    get: {
      tags: ["Projects"],
      description: "Trả về toàn bộ dự án do một nhân viên cụ thể tạo ra. Dùng để theo dõi phạm vi trách nhiệm của người tạo dự án, phục vụ màn hình hồ sơ nhân sự hoặc báo cáo quản lý công việc.",
      summary: "Lấy dự án theo người tạo",
      ...projectAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "Danh sách dự án do nhân viên tạo", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } } } } },
      },
    },
  },
  "/api/projects/{id}": {
    get: {
      tags: ["Projects"],
      description: "Lấy thông tin chi tiết của một dự án theo ID, bao gồm mô tả, trạng thái, mức ưu tiên, tiến độ, thời gian dự kiến và các mốc thời gian liên quan. Endpoint này thường dùng khi mở màn hình chi tiết hoặc form sửa dự án.",
      summary: "Xem chi tiết dự án",
      ...projectAuth,
      parameters: [projectIdParam],
      responses: {
        200: { description: "Thông tin dự án", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Project" } } } } } },
        400: { description: "ID dự án không hợp lệ" },
        404: { description: "Không tìm thấy dự án" },
      },
    },
    patch: {
      tags: ["Projects"],
      summary: "Cập nhật dự án (gồm tự đánh giá progress)",
      description: "Chỉ Manager mới được cập nhật dự án (Admin bị chặn bởi thiết kế).",
      ...projectAuth,
      parameters: [projectIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, data: { $ref: "#/components/schemas/Project" } } } } } },
        403: { description: "Không đủ quyền (chỉ Manager)" },
        404: { description: "Không tìm thấy dự án" },
      },
    },
    delete: {
      tags: ["Projects"],
      description: "Xoá một dự án khỏi hệ thống theo ID. Chỉ dùng khi dự án không còn cần theo dõi hoặc đã được chuyển sang trạng thái phù hợp; thao tác này nên được thực hiện thận trọng vì có thể ảnh hưởng đến task, phân công và nhật ký liên quan.",
      summary: "Xoá dự án",
      ...projectAuth,
      parameters: [projectIdParam],
      responses: {
        200: { description: "Xoá dự án thành công" },
        403: { description: "Không đủ quyền (chỉ Admin)" },
      },
    },
  },
  "/api/projects/{id}/employees": {
    get: {
      tags: ["Projects"],
      description: "Lấy danh sách tất cả nhân viên đang được gán vào dự án để hiển thị thành viên dự án, vai trò của từng người và phục vụ các thao tác quản trị phân công.",
      summary: "Danh sách nhân viên được gán cho dự án",
      ...projectAuth,
      parameters: [projectIdParam],
      responses: {
        200: { description: "Danh sách nhân viên trong dự án" },
        400: { description: "ID dự án không hợp lệ" },
        404: { description: "Không tìm thấy dự án" },
      },
    },
  },
  "/api/projects/{id}/avatar": {
    post: {
      tags: ["Projects"],
      summary: "Cập nhật ảnh đại diện dự án",
      description: "Ảnh (jpg/png/gif/webp) tối đa 5MB, lưu trên Cloudinary. Chỉ Manager được thao tác.",
      ...projectAuth,
      parameters: [projectIdParam],
      requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["avatar"], properties: { avatar: { type: "string", format: "binary" } } } } } },
      responses: {
        200: { description: "Cập nhật ảnh đại diện thành công" },
        400: { description: "Thiếu file hoặc định dạng không hợp lệ" },
        403: { description: "Không đủ quyền (chỉ Manager)" },
        404: { description: "Không tìm thấy dự án" },
      },
    },
    delete: {
      tags: ["Projects"],
      summary: "Xoá ảnh đại diện dự án (về null)",
      description: "Xoá file trên Cloudinary và đặt avatar về null. Chỉ Manager được thao tác.",
      ...projectAuth,
      parameters: [projectIdParam],
      responses: {
        200: { description: "Xoá ảnh đại diện thành công" },
        403: { description: "Không đủ quyền (chỉ Manager)" },
        404: { description: "Không tìm thấy dự án" },
      },
    },
  },
};
