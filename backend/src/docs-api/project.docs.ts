export const projectSchemas = {
  Project: {
    type: "object",
    example: {
      id: "60000000-0000-4000-a000-000000000001",
      title: "CRM Revamp",
      description: "Cải tổ hệ thống CRM cho bộ phận kinh doanh",
      avatarURL: "https://res.cloudinary.com/demo/image/upload/project-avatar.jpg",
      priority: "high",
      status: "in_progress",
      progress: 42,
      startDate: "2026-01-05",
      dueDate: "2026-08-30",
      assignedBy: "30000000-0000-4000-a000-000000000001",
      createdBy: "30000000-0000-4000-a000-000000000001",
      estimatedHours: 240,
      actualHours: 96,
      completedAt: null,
      createdAt: "2026-01-05T02:00:00.000Z",
      updatedAt: "2026-08-04T08:30:00.000Z",
    },
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
    example: {
      title: "CRM Revamp",
      description: "Cải tổ hệ thống CRM cho bộ phận kinh doanh",
      priority: "high",
      status: "todo",
      progress: 0,
      startDate: "2026-01-05",
      dueDate: "2026-08-30",
      estimatedHours: 240,
      actualHours: 0,
    },
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
    example: {
      data: [
        {
          id: "50000000-0000-4000-a000-000000000001",
          title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
          description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
          avatarURL: null,
          priority: "high",
          status: "in_progress",
          progress: 60,
          startDate: "2025-06-01",
          dueDate: "2025-09-30",
          assignedBy: "30000000-0000-4000-a000-000000000001",
          createdBy: "30000000-0000-4000-a000-000000000001",
          estimatedHours: 500,
          actualHours: 280,
          completedAt: null,
          createdAt: "2025-06-01T00:00:00.000Z",
          updatedAt: "2025-07-20T00:00:00.000Z",
        },
      ],
    },
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
  schema: { type: "string", format: "uuid", example: "50000000-0000-4000-a000-000000000001" },
};

export const projectPaths = {
  "/api/projects": {
    get: {
      tags: ["Projects"],
      summary: "Danh sách dự án",
      description:
        "Admin xem được toàn bộ dự án và thống kê liên quan; nhân viên thường chỉ thấy dự án của mình (phân công, người tạo hoặc cùng phòng ban). " +
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
        200: {
          description: "Danh sách dự án phân trang",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedProjects" },
              example: {
                data: [
                  {
                    id: "50000000-0000-4000-a000-000000000001",
                    title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                    description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                    avatarURL: null,
                    priority: "high",
                    status: "in_progress",
                    progress: 60,
                    startDate: "2025-06-01",
                    dueDate: "2025-09-30",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    estimatedHours: 500,
                    actualHours: 280,
                    completedAt: null,
                    createdAt: "2025-06-01T00:00:00.000Z",
                    updatedAt: "2025-07-20T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Projects"],
      summary: "Tạo dự án",
      description: "Chỉ Manager được tạo dự án. Người tạo được ghi nhận tự động từ token và admin chỉ có quyền xem, không tham gia thao tác tạo mới.",
      ...projectAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } } },
      responses: {
        201: {
          description: "Tạo dự án thành công và trả về dữ liệu dự án vừa khởi tạo.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Project" } } },
              example: {
                data: {
                  id: "60000000-0000-4000-a000-000000000001",
                  title: "CRM Revamp",
                  description: "Cải tổ hệ thống CRM cho bộ phận kinh doanh",
                  avatarURL: "https://res.cloudinary.com/demo/image/upload/project-avatar.jpg",
                  priority: "high",
                  status: "todo",
                  progress: 0,
                  startDate: "2026-01-05",
                  dueDate: "2026-08-30",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  estimatedHours: 240,
                  actualHours: 0,
                  completedAt: null,
                  createdAt: "2026-08-04T08:30:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Dữ liệu dự án không hợp lệ hoặc thiếu trường bắt buộc.",
          content: { "application/json": { example: { message: "Dữ liệu dự án không hợp lệ hoặc thiếu trường bắt buộc." } } },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được tạo dự án.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được tạo dự án." } } },
        },
      },
    },
  },
  "/api/projects/me": {
    get: {
      tags: ["Projects"],
      summary: "Dự án của tôi",
      description: "Trả về các dự án mà nhân viên hiện tại được phân công hoặc đã tạo.",
      ...projectAuth,
      responses: {
        200: {
          description: "Danh sách dự án của tôi",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } },
              example: {
                data: [
                  {
                    id: "50000000-0000-4000-a000-000000000001",
                    title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                    description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                    avatarURL: null,
                    priority: "high",
                    status: "in_progress",
                    progress: 60,
                    startDate: "2025-06-01",
                    dueDate: "2025-09-30",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    estimatedHours: 500,
                    actualHours: 280,
                    completedAt: null,
                    createdAt: "2025-06-01T00:00:00.000Z",
                    updatedAt: "2025-07-20T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/projects/status/{status}": {
    get: {
      tags: ["Projects"],
      summary: "Lọc theo trạng thái",
      description: "Admin xem được toàn bộ; nhân viên thường chỉ thấy dự án của mình. Endpoint này chỉ phục vụ tra cứu, không cho admin tham gia ghi dữ liệu.",
      ...projectAuth,
      parameters: [{ name: "status", in: "path", required: true, schema: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] } }],
      responses: {
        200: {
          description: "Danh sách dự án theo trạng thái",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } },
              example: {
                data: [
                  {
                    id: "50000000-0000-4000-a000-000000000001",
                    title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                    description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                    avatarURL: null,
                    priority: "high",
                    status: "in_progress",
                    progress: 60,
                    startDate: "2025-06-01",
                    dueDate: "2025-09-30",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    estimatedHours: 500,
                    actualHours: 280,
                    completedAt: null,
                    createdAt: "2025-06-01T00:00:00.000Z",
                    updatedAt: "2025-07-20T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/projects/priority/{priority}": {
    get: {
      tags: ["Projects"],
      description: "Lọc danh sách dự án theo mức độ ưu tiên để ưu tiên hiển thị các công việc quan trọng trước. Hữu ích cho dashboard, báo cáo và các màn hình theo dõi tiến độ tập trung vào độ gấp của dự án.",
      summary: "Lọc theo ưu tiên",
      ...projectAuth,
      parameters: [{ name: "priority", in: "path", required: true, schema: { type: "string", enum: ["low", "medium", "high", "critical"] } }],
      responses: {
        200: {
          description: "Danh sách dự án theo độ ưu tiên",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } },
              example: {
                data: [
                  {
                    id: "50000000-0000-4000-a000-000000000001",
                    title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                    description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                    avatarURL: null,
                    priority: "high",
                    status: "in_progress",
                    progress: 60,
                    startDate: "2025-06-01",
                    dueDate: "2025-09-30",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    estimatedHours: 500,
                    actualHours: 280,
                    completedAt: null,
                    createdAt: "2025-06-01T00:00:00.000Z",
                    updatedAt: "2025-07-20T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/projects/created-by/{employeeId}": {
    get: {
      tags: ["Projects"],
      description: "Trả về toàn bộ dự án do một nhân viên cụ thể tạo ra. Dùng để theo dõi phạm vi trách nhiệm của người tạo dự án, phục vụ màn hình hồ sơ nhân sự hoặc báo cáo quản lý công việc.",
      summary: "Dự án theo người tạo",
      ...projectAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Danh sách dự án do nhân viên tạo",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Project" } } } },
              example: {
                data: [
                  {
                    id: "50000000-0000-4000-a000-000000000001",
                    title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                    description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                    avatarURL: null,
                    priority: "high",
                    status: "in_progress",
                    progress: 60,
                    startDate: "2025-06-01",
                    dueDate: "2025-09-30",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    estimatedHours: 500,
                    actualHours: 280,
                    completedAt: null,
                    createdAt: "2025-06-01T00:00:00.000Z",
                    updatedAt: "2025-07-20T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/projects/{id}": {
    get: {
      tags: ["Projects"],
      description: "Lấy thông tin chi tiết của một dự án theo ID, bao gồm mô tả, trạng thái, mức ưu tiên, tiến độ, thời gian dự kiến và các mốc thời gian liên quan. Endpoint này thường dùng khi mở màn hình chi tiết hoặc form sửa dự án.",
      summary: "Chi tiết dự án",
      ...projectAuth,
      parameters: [{ ...projectIdParam, schema: { ...projectIdParam.schema, example: "50000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Trả về thông tin chi tiết của dự án theo ID.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Project" } } },
              example: {
                data: {
                  id: "50000000-0000-4000-a000-000000000001",
                  title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                  description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                  avatarURL: null,
                  priority: "high",
                  status: "in_progress",
                  progress: 60,
                  startDate: "2025-06-01",
                  dueDate: "2025-09-30",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  estimatedHours: 500,
                  actualHours: 280,
                  completedAt: null,
                  createdAt: "2025-06-01T00:00:00.000Z",
                  updatedAt: "2025-07-20T00:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "ID dự án không hợp lệ.",
          content: { "application/json": { example: { message: "ID dự án không hợp lệ." } } },
        },
        404: {
          description: "Không tìm thấy dự án tương ứng với ID đã cung cấp.",
          content: { "application/json": { example: { message: "Không tìm thấy dự án tương ứng với ID đã cung cấp." } } },
        },
      },
    },
    patch: {
      tags: ["Projects"],
      summary: "Cập nhật dự án",
      description: "Chỉ Manager mới được cập nhật dự án. Admin vẫn xem được chi tiết nhưng không được sửa nội dung hay tiến độ.",
      ...projectAuth,
      parameters: [{ ...projectIdParam, schema: { ...projectIdParam.schema, example: "50000000-0000-4000-a000-000000000001" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } } },
      responses: {
        200: {
          description: "Cập nhật dự án thành công và trả về dữ liệu mới nhất.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { message: { type: "string" }, data: { $ref: "#/components/schemas/Project" } } },
              example: {
                message: "Cập nhật dự án thành công",
                data: {
                  id: "50000000-0000-4000-a000-000000000001",
                  title: "Xây dựng website Hệ Thống Quản Lý Phòng Ban & Dự Án",
                  description: "Dự án xây dựng website quản lý công việc nội bộ cho công ty, bao gồm các module quản lý nhân sự, dự án, và báo cáo",
                  avatarURL: null,
                  priority: "high",
                  status: "review",
                  progress: 75,
                  startDate: "2025-06-01",
                  dueDate: "2025-09-30",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  estimatedHours: 500,
                  actualHours: 320,
                  completedAt: null,
                  createdAt: "2025-06-01T00:00:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được cập nhật dự án.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được cập nhật dự án." } } },
        },
        404: {
          description: "Không tìm thấy dự án cần cập nhật.",
          content: { "application/json": { example: { message: "Không tìm thấy dự án cần cập nhật." } } },
        },
      },
    },
    delete: {
      tags: ["Projects"],
      description: "Xoá một dự án khỏi hệ thống theo ID. Chỉ dùng khi dự án không còn cần theo dõi hoặc đã được chuyển sang trạng thái phù hợp; thao tác này nên được thực hiện thận trọng vì có thể ảnh hưởng đến task, phân công và nhật ký liên quan.",
      summary: "Xoá dự án",
      ...projectAuth,
      parameters: [{ ...projectIdParam, schema: { ...projectIdParam.schema, example: "50000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Xoá dự án thành công khỏi hệ thống.",
          content: {
            "application/json": {
              example: {
                message: "Xoá dự án thành công khỏi hệ thống.",
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được xoá dự án.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được xoá dự án." } } },
        },
      },
    },
  },
  "/api/projects/{id}/employees": {
    get: {
      tags: ["Projects"],
      description: "Lấy danh sách tất cả nhân viên đang được gán vào dự án để hiển thị thành viên dự án, vai trò của từng người và phục vụ các thao tác quản trị phân công.",
      summary: "Nhân viên của dự án",
      ...projectAuth,
      parameters: [{ ...projectIdParam, schema: { ...projectIdParam.schema, example: "50000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Trả về danh sách nhân viên đang được gán cho dự án.",
          content: {
            "application/json": {
              example: {
                data: [
                  {
                    id: "60000000-0000-4000-a000-000000000001",
                    projectId: "50000000-0000-4000-a000-000000000001",
                    employeeId: "30000000-0000-4000-a000-000000000001",
                    role: "leader",
                    assignedAt: "2025-06-01T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
        400: {
          description: "ID dự án không hợp lệ.",
          content: { "application/json": { example: { message: "ID dự án không hợp lệ." } } },
        },
        404: {
          description: "Không tìm thấy dự án tương ứng với ID đã cung cấp.",
          content: { "application/json": { example: { message: "Không tìm thấy dự án tương ứng với ID đã cung cấp." } } },
        },
      },
    },
  },
  "/api/projects/{id}/avatar": {
    post: {
      tags: ["Projects"],
      summary: "Ảnh dự án",
      description: "Ảnh (jpg/png/gif/webp) tối đa 5MB, lưu trên Cloudinary. Chỉ Manager được thao tác.",
      ...projectAuth,
      parameters: [{ ...projectIdParam, schema: { ...projectIdParam.schema, example: "50000000-0000-4000-a000-000000000001" } }],
      requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["avatar"], properties: { avatar: { type: "string", format: "binary" } } } } } },
      responses: {
        200: {
          description: "Cập nhật ảnh đại diện dự án thành công.",
          content: {
            "application/json": {
              example: {
                message: "Cập nhật ảnh đại diện dự án thành công.",
                data: {
                  avatarURL: "https://res.cloudinary.com/demo/image/upload/project-avatar.jpg",
                },
              },
            },
          },
        },
        400: {
          description: "Thiếu file hoặc định dạng file không hợp lệ.",
          content: { "application/json": { example: { message: "Thiếu file hoặc định dạng file không hợp lệ." } } },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được thao tác.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được thao tác." } } },
        },
        404: {
          description: "Không tìm thấy dự án cần cập nhật ảnh.",
          content: { "application/json": { example: { message: "Không tìm thấy dự án cần cập nhật ảnh." } } },
        },
      },
    },
    delete: {
      tags: ["Projects"],
      summary: "Xoá ảnh dự án",
      description: "Xoá file trên Cloudinary và đặt avatar về null. Chỉ Manager được thao tác.",
      ...projectAuth,
      parameters: [projectIdParam],
      responses: {
        200: {
          description: "Xoá ảnh đại diện dự án thành công và đưa avatar về null.",
          content: {
            "application/json": {
              example: {
                message: "Xoá ảnh đại diện dự án thành công và đưa avatar về null.",
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được thao tác.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được thao tác." } } },
        },
        404: {
          description: "Không tìm thấy dự án cần xoá ảnh đại diện.",
          content: { "application/json": { example: { message: "Không tìm thấy dự án cần xoá ảnh đại diện." } } },
        },
      },
    },
  },
};
