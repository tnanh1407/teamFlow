export const projectEmployeeSchemas = {
  ProjectEmployee: {
    type: "object",
    example: {
      id: "60000000-0000-4000-a000-000000000001",
      projectId: "50000000-0000-4000-a000-000000000001",
      employeeId: "30000000-0000-4000-a000-000000000001",
      role: "leader",
      assignedAt: "2025-06-01T00:00:00.000Z",
    },
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
    example: {
      projectId: "50000000-0000-4000-a000-000000000002",
      employeeId: "30000000-0000-4000-a000-000000000003",
      role: "member",
    },
    properties: {
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      role: { type: "string", enum: ["leader", "member", "reviewer"], default: "member" },
    },
  },
  ProjectRoleInput: {
    type: "object",
    required: ["role"],
    example: {
      role: "reviewer",
    },
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
      summary: "Danh sách phân công",
      description: "Admin và Manager đều có thể xem danh sách để theo dõi phân công, nhưng chỉ Manager mới được thao tác ghi dữ liệu.",
      ...peAuth,
      responses: {
        200: {
          description: "Danh sách phân công",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectEmployee" } } } },
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
        403: {
          description: "Không đủ quyền (chỉ Manager)",
          content: { "application/json": { example: { message: "Không đủ quyền (chỉ Manager)" } } },
        },
      },
    },
    post: {
      tags: ["Project Employees"],
      summary: "Thêm nhân viên",
      description: "Chỉ Manager được thêm nhân viên vào dự án. Admin có thể xem danh sách phân công nhưng không được trở thành người tham gia trực tiếp.",
      ...peAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectEmployeeInput" } } } },
      responses: {
        201: {
          description: "Phân công thành công",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectEmployee" } } },
              example: {
                data: {
                  id: "60000000-0000-4000-a000-000000000011",
                  projectId: "50000000-0000-4000-a000-000000000002",
                  employeeId: "30000000-0000-4000-a000-000000000003",
                  role: "member",
                  assignedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Dữ liệu không hợp lệ",
          content: { "application/json": { example: { message: "Dữ liệu không hợp lệ" } } },
        },
        403: {
          description: "Không đủ quyền (chỉ Manager)",
          content: { "application/json": { example: { message: "Không đủ quyền (chỉ Manager)" } } },
        },
      },
    },
  },
  "/api/project-employees/employee/{employeeId}": {
    get: {
      tags: ["Project Employees"],
      description: "Lấy toàn bộ các phân công dự án của một nhân viên cụ thể. Endpoint này hữu ích khi xem hồ sơ nhân sự, đánh giá khối lượng công việc hoặc hiển thị danh sách dự án mà nhân viên đó đang tham gia.",
      summary: "Phân công theo nhân viên",
      ...peAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000003" } }],
      responses: {
        200: {
          description: "Danh sách dự án của nhân viên",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectEmployee" } } } },
              example: {
                data: [
                  {
                    id: "60000000-0000-4000-a000-000000000001",
                    projectId: "50000000-0000-4000-a000-000000000001",
                    employeeId: "30000000-0000-4000-a000-000000000003",
                    role: "member",
                    assignedAt: "2025-06-01T00:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/project-employees/{id}": {
    get: {
      tags: ["Project Employees"],
      description: "Lấy chi tiết một bản ghi phân công theo ID để xem nhân viên nào đang giữ vai trò gì trong dự án nào, phục vụ màn hình quản trị phân công và kiểm tra lịch sử gán việc.",
      summary: "Chi tiết phân công",
      ...peAuth,
      parameters: [{ ...peIdParam, schema: { ...peIdParam.schema, example: "60000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Thông tin phân công",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectEmployee" } } },
              example: {
                data: {
                  id: "60000000-0000-4000-a000-000000000001",
                  projectId: "50000000-0000-4000-a000-000000000001",
                  employeeId: "30000000-0000-4000-a000-000000000001",
                  role: "leader",
                  assignedAt: "2025-06-01T00:00:00.000Z",
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
      tags: ["Project Employees"],
      summary: "Cập nhật vai trò",
      description: "Chỉ Manager được đổi vai trò phân công. Admin chỉ xem được dữ liệu, không can thiệp vai trò tham gia dự án.",
      ...peAuth,
      parameters: [peIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectRoleInput" } } } },
      responses: {
        200: {
          description: "Cập nhật vai trò thành công",
          content: {
            "application/json": {
              example: {
                data: {
                  id: "60000000-0000-4000-a000-000000000001",
                  projectId: "50000000-0000-4000-a000-000000000001",
                  employeeId: "30000000-0000-4000-a000-000000000001",
                  role: "reviewer",
                  assignedAt: "2025-06-01T00:00:00.000Z",
                },
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền (chỉ Manager)",
          content: { "application/json": { example: { message: "Không đủ quyền (chỉ Manager)" } } },
        },
      },
    },
    delete: {
      tags: ["Project Employees"],
      summary: "Xoá phân công",
      description: "Chỉ Manager hoặc chính người được gán mới được xoá khỏi dự án. Admin không tham gia trực tiếp nên không có quyền xoá phân công.",
      ...peAuth,
      parameters: [peIdParam],
      responses: {
        200: {
          description: "Xoá phân công thành công",
          content: {
            "application/json": {
              example: {
                message: "Xoá phân công thành công",
              },
            },
          },
        },
      },
    },
  },
};
