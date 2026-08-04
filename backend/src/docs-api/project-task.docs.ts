export const projectTaskSchemas = {
  ProjectTask: {
    type: "object",
    example: {
      id: "70000000-0000-4000-a000-000000000001",
      projectId: "60000000-0000-4000-a000-000000000001",
      title: "Tích hợp báo cáo doanh thu",
      description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
      status: "in_progress",
      priority: "high",
      assignedTo: "30000000-0000-4000-a000-000000000001",
      assignedBy: "30000000-0000-4000-a000-000000000001",
      assignedAt: "2026-08-04T08:00:00.000Z",
      dueDate: "2026-08-20",
      createdBy: "30000000-0000-4000-a000-000000000001",
      completedAt: null,
      createdAt: "2026-08-04T08:00:00.000Z",
      updatedAt: "2026-08-04T08:30:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      assignedTo: { type: "string", format: "uuid", nullable: true, description: "Nhân viên được giao task" },
      assignedBy: { type: "string", format: "uuid", nullable: true },
      assignedAt: { type: "string", format: "date-time", nullable: true },
      dueDate: { type: "string", format: "date", nullable: true },
      createdBy: { type: "string", format: "uuid", nullable: true },
      completedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectTaskInput: {
    type: "object",
    required: ["projectId", "title"],
    example: {
      projectId: "60000000-0000-4000-a000-000000000001",
      title: "Tích hợp báo cáo doanh thu",
      description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
      status: "todo",
      priority: "high",
      assignedTo: "30000000-0000-4000-a000-000000000001",
      dueDate: "2026-08-20",
    },
    properties: {
      projectId: { type: "string", format: "uuid" },
      title: { type: "string" },
      description: { type: "string" },
      status: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      assignedTo: { type: "string", format: "uuid" },
      dueDate: { type: "string", format: "date" },
    },
  },
};

const taskAuth = { security: [{ cookieAuth: [] }] };

const taskIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid", example: "70000000-0000-4000-a000-000000000001" },
};

export const projectTaskPaths = {
  "/api/project-tasks": {
    get: {
      tags: ["Project Tasks"],
      description: "Trả về toàn bộ task trong hệ thống mà người dùng có quyền xem. Endpoint này phù hợp cho màn hình tổng quan công việc, bộ lọc admin và các view theo dõi trạng thái công việc trên nhiều dự án.",
      summary: "Danh sách task",
      ...taskAuth,
      responses: {
        200: {
          description: "Danh sách task",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } },
              example: {
                data: [
                  {
                    id: "70000000-0000-4000-a000-000000000001",
                    projectId: "60000000-0000-4000-a000-000000000001",
                    title: "Tích hợp báo cáo doanh thu",
                    description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                    status: "in_progress",
                    priority: "high",
                    assignedTo: "30000000-0000-4000-a000-000000000001",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    assignedAt: "2026-08-04T08:00:00.000Z",
                    dueDate: "2026-08-20",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    completedAt: null,
                    createdAt: "2026-08-04T08:00:00.000Z",
                    updatedAt: "2026-08-04T08:30:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Project Tasks"],
      summary: "Tạo/giao task",
      description: "Chỉ Manager được tạo/giao task (Admin chỉ xem, không tạo).",
      ...taskAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectTaskInput" } } } },
      responses: {
        201: {
          description: "Tạo hoặc giao task thành công và trả về task vừa được khởi tạo.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectTask" } } },
              example: {
                data: {
                  id: "70000000-0000-4000-a000-000000000001",
                  projectId: "60000000-0000-4000-a000-000000000001",
                  title: "Tích hợp báo cáo doanh thu",
                  description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                  status: "todo",
                  priority: "high",
                  assignedTo: "30000000-0000-4000-a000-000000000001",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  assignedAt: "2026-08-04T08:00:00.000Z",
                  dueDate: "2026-08-20",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  completedAt: null,
                  createdAt: "2026-08-04T08:00:00.000Z",
                  updatedAt: "2026-08-04T08:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Dữ liệu task không hợp lệ hoặc thiếu trường bắt buộc.",
          content: { "application/json": { example: { message: "Dữ liệu task không hợp lệ hoặc thiếu trường bắt buộc." } } },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được tạo/giao task.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được tạo/giao task." } } },
        },
      },
    },
  },
  "/api/project-tasks/project/{projectId}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy danh sách task thuộc một dự án cụ thể, đồng thời hỗ trợ lọc theo trạng thái, nhân viên được giao và từ khoá tìm kiếm. Đây là endpoint chính cho màn hình chi tiết dự án và bảng công việc của dự án.",
      summary: "Task theo dự án",
      ...taskAuth,
      parameters: [
        { name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "50000000-0000-4000-a000-000000000001" } },
        { name: "q", in: "query", schema: { type: "string" }, description: "Tìm theo tiêu đề hoặc mô tả" },
        { name: "status", in: "query", schema: { type: "string", enum: ["todo", "in_progress", "review", "completed", "cancelled"] } },
        { name: "assignedTo", in: "query", schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000001" }, description: "Lọc theo nhân viên được giao" },
      ],
      responses: {
        200: {
          description: "Trả về danh sách task thuộc dự án sau khi áp dụng các bộ lọc đã gửi lên.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } },
              example: {
                data: [
                  {
                    id: "70000000-0000-4000-a000-000000000001",
                    projectId: "60000000-0000-4000-a000-000000000001",
                    title: "Tích hợp báo cáo doanh thu",
                    description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                    status: "in_progress",
                    priority: "high",
                    assignedTo: "30000000-0000-4000-a000-000000000001",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    assignedAt: "2026-08-04T08:00:00.000Z",
                    dueDate: "2026-08-20",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    completedAt: null,
                    createdAt: "2026-08-04T08:00:00.000Z",
                    updatedAt: "2026-08-04T08:30:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/project-tasks/employee/{id}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy toàn bộ task được giao cho một nhân viên cụ thể để phục vụ hồ sơ cá nhân, màn hình công việc của tôi hoặc báo cáo tải công việc theo người.",
      summary: "Task theo nhân viên",
      ...taskAuth,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000003" } }],
      responses: {
        200: {
          description: "Trả về toàn bộ task đang được giao cho nhân viên đã chỉ định.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectTask" } } } },
              example: {
                data: [
                  {
                    id: "70000000-0000-4000-a000-000000000001",
                    projectId: "60000000-0000-4000-a000-000000000001",
                    title: "Tích hợp báo cáo doanh thu",
                    description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                    status: "in_progress",
                    priority: "high",
                    assignedTo: "30000000-0000-4000-a000-000000000001",
                    assignedBy: "30000000-0000-4000-a000-000000000001",
                    assignedAt: "2026-08-04T08:00:00.000Z",
                    dueDate: "2026-08-20",
                    createdBy: "30000000-0000-4000-a000-000000000001",
                    completedAt: null,
                    createdAt: "2026-08-04T08:00:00.000Z",
                    updatedAt: "2026-08-04T08:30:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/project-tasks/{id}": {
    get: {
      tags: ["Project Tasks"],
      description: "Lấy thông tin chi tiết của một task theo ID, bao gồm tiêu đề, mô tả, trạng thái, độ ưu tiên, người được giao và các mốc thời gian liên quan. Dùng cho màn hình chi tiết và form chỉnh sửa task.",
      summary: "Chi tiết task",
      ...taskAuth,
      parameters: [taskIdParam],
      responses: {
        200: {
          description: "Trả về thông tin chi tiết của task theo ID.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectTask" } } },
              example: {
                data: {
                  id: "70000000-0000-4000-a000-000000000001",
                  projectId: "60000000-0000-4000-a000-000000000001",
                  title: "Tích hợp báo cáo doanh thu",
                  description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                  status: "in_progress",
                  priority: "high",
                  assignedTo: "30000000-0000-4000-a000-000000000001",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  assignedAt: "2026-08-04T08:00:00.000Z",
                  dueDate: "2026-08-20",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  completedAt: null,
                  createdAt: "2026-08-04T08:00:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy task tương ứng với ID đã cung cấp.",
          content: { "application/json": { example: { message: "Không tìm thấy task tương ứng với ID đã cung cấp." } } },
        },
      },
    },
    patch: {
      tags: ["Project Tasks"],
      summary: "Cập nhật task",
      description: "Manager hoặc chính nhân viên được giao (assignee) mới được cập nhật.",
      ...taskAuth,
      parameters: [taskIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectTaskInput" } } } },
      responses: {
        200: {
          description: "Cập nhật task thành công và đồng bộ trạng thái mới nhất.",
          content: {
            "application/json": {
              example: {
                data: {
                  id: "70000000-0000-4000-a000-000000000001",
                  projectId: "60000000-0000-4000-a000-000000000001",
                  title: "Tích hợp báo cáo doanh thu",
                  description: "Phát triển màn hình và API báo cáo doanh thu theo tháng",
                  status: "review",
                  priority: "high",
                  assignedTo: "30000000-0000-4000-a000-000000000001",
                  assignedBy: "30000000-0000-4000-a000-000000000001",
                  assignedAt: "2026-08-04T08:00:00.000Z",
                  dueDate: "2026-08-20",
                  createdBy: "30000000-0000-4000-a000-000000000001",
                  completedAt: null,
                  createdAt: "2026-08-04T08:00:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager hoặc assignee mới được cập nhật.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager hoặc assignee mới được cập nhật." } } },
        },
        404: {
          description: "Không tìm thấy task cần cập nhật.",
          content: { "application/json": { example: { message: "Không tìm thấy task cần cập nhật." } } },
        },
      },
    },
    delete: {
      tags: ["Project Tasks"],
      description: "Xoá một task khỏi hệ thống theo ID. Thao tác này thường chỉ dành cho Manager và nên thực hiện khi task được tạo nhầm hoặc không còn hợp lệ.",
      summary: "Xoá task",
      ...taskAuth,
      parameters: [taskIdParam],
      responses: {
        200: {
          description: "Xoá task thành công khỏi hệ thống.",
          content: {
            "application/json": {
              example: {
                message: "Xoá task thành công khỏi hệ thống.",
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì chỉ Manager được xoá task.",
          content: { "application/json": { example: { message: "Không đủ quyền vì chỉ Manager được xoá task." } } },
        },
      },
    },
  },
};
