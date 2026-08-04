export const userSchemas = {
  User: {
    type: "object",
    example: {
      id: "30000000-0000-4000-a000-000000000001",
      departmentId: null,
      positionId: null,
      employeeCode: null,
      name: "Nguyễn Văn Anh",
      email: "nguyenvananh@qlpbda.com",
      phone: "0901234567",
      birthDate: "1998-03-21",
      hireDate: "2023-06-01",
      leaveDate: null,
      gender: "male",
      username: "root",
      role: "admin",
      status: true,
      avatarURL: null,
      lastLogin: null,
      createdAt: "2026-01-01T08:00:00.000Z",
      updatedAt: "2026-01-01T08:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      departmentId: { type: "string", format: "uuid", nullable: true, description: "UUID phòng ban. Admin có thể để null; nhân viên thường phải có giá trị." },
      positionId: { type: "string", format: "uuid", nullable: true, description: "UUID chức vụ. Admin có thể để null; nhân viên thường phải có giá trị." },
      employeeCode: { type: "string", nullable: true, description: "Mã nhân sự. Admin được phép null; nhân viên thường phải có mã theo quy tắc mã phòng ban + 6 ký tự." },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string", nullable: true },
      birthDate: { type: "string", format: "date", nullable: true },
      hireDate: { type: "string", format: "date", nullable: true },
      leaveDate: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Ngày nghỉ việc, null nếu nhân viên còn đang làm",
      },
      gender: { type: "string", enum: ["male", "female", "other"] },
      username: { type: "string" },
      role: { type: "string", enum: ["user", "admin"] },
      status: {
        type: "boolean",
        description: "true = đang làm, false = đã nghỉ việc hoặc bị khoá",
      },
      avatarURL: { type: "string", nullable: true },
      lastLogin: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  UserInput: {
    type: "object",
    required: ["name", "email", "username", "password"],
    example: {
      departmentId: "10000000-0000-4000-a000-000000000001",
      positionId: "20000000-0000-4000-a000-000000000005",
      employeeCode: "ITABC123",
      name: "Trần Thị B",
      email: "tranthib@qlpbda.com",
      phone: "0912345678",
      birthDate: "1999-07-10",
      hireDate: "2026-01-01",
      leaveDate: null,
      gender: "female",
      username: "tranthib",
      password: "12345678",
      status: true,
    },
    properties: {
      departmentId: { type: "string", description: "Department UUID" },
      positionId: { type: "string", description: "Position UUID" },
      employeeCode: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      birthDate: { type: "string", format: "date" },
      hireDate: { type: "string", format: "date" },
      leaveDate: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Có thể để null; nếu có giá trị thì hệ thống sẽ tự chuyển status về false",
      },
      gender: { type: "string", enum: ["male", "female", "other"], default: "other" },
      username: { type: "string" },
      password: { type: "string", minLength: 6 },
      status: {
        type: "boolean",
        default: true,
        description: "Nếu false thì leaveDate sẽ được ghi theo thời điểm hiện tại",
      },
    },
  },
  LoginInput: {
    type: "object",
    required: ["username", "password"],
    example: {
      username: "root",
      password: "12345678",
    },
    properties: {
      username: { type: "string" },
      password: { type: "string" },
    },
  },
  LoginResponse: {
    type: "object",
    example: {
      data: {
        user: {
          id: "30000000-0000-4000-a000-000000000001",
          departmentId: "40000000-0000-4000-a000-000000000010",
          positionId: "50000000-0000-4000-a000-000000000010",
          employeeCode: null,
          name: "Nguyễn Văn Anh",
          email: "nguyenvana@company.local",
          phone: "0901234567",
          birthDate: "1998-03-21",
          hireDate: "2024-01-15",
          leaveDate: null,
          gender: "male",
          username: "nguyenvana",
          role: "user",
          status: true,
          avatarURL: null,
          lastLogin: "2026-08-04T08:30:00.000Z",
          createdAt: "2026-01-15T08:00:00.000Z",
          updatedAt: "2026-08-04T08:30:00.000Z",
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
      },
    },
    properties: {
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
    },
  },
  UpdateMeInput: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    example: {
      currentPassword: "12345678",
      newPassword: "87654321",
    },
    properties: {
      currentPassword: { type: "string" },
      newPassword: { type: "string", minLength: 6 },
    },
  },
  ForgotPasswordInput: {
    type: "object",
    required: ["email", "employeeCode"],
    example: {
      email: "nguyenvananh@qlpbda.com",
      employeeCode: "EMP001",
    },
    properties: {
      email: { type: "string", format: "email" },
      employeeCode: { type: "string", description: "Mã nhân viên" },
    },
  },
  ResetPasswordInput: {
    type: "object",
    required: ["email", "code", "newPassword"],
    example: {
      email: "nguyenvananh@qlpbda.com",
      code: "123456",
      newPassword: "87654321",
    },
    properties: {
      email: { type: "string", format: "email" },
      code: { type: "string", description: "Mã 6 số gửi qua email" },
      newPassword: { type: "string", minLength: 6 },
    },
  },
  Error: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
  PaginatedUsers: {
    type: "object",
    example: {
      data: [
        {
          id: "30000000-0000-4000-a000-000000000001",
          departmentId: "10000000-0000-4000-a000-000000000001",
          positionId: "20000000-0000-4000-a000-000000000001",
          employeeCode: null,
          name: "Nguyễn Văn Anh",
          email: "nguyenvananh@qlpbda.com",
          phone: "0901234001",
          birthDate: "1985-03-15",
          hireDate: "2023-06-01",
          leaveDate: null,
          gender: "male",
          username: "root",
          role: "admin",
          status: true,
          avatarURL: null,
          lastLogin: null,
          createdAt: "2026-01-01T08:00:00.000Z",
          updatedAt: "2026-01-01T08:00:00.000Z",
        },
      ],
    },
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/User" },
      },
    },
  },
};

export const userPaths = {
  "/api/users/login": {
    post: {
      tags: ["Users"],
      description: "Xác thực tài khoản bằng username và mật khẩu để tạo phiên đăng nhập mới. Endpoint này chỉ trả về token khi tài khoản còn hoạt động; nếu tài khoản đã nghỉ việc hoặc bị khoá thì hệ thống sẽ từ chối với 403 và không tạo session.",
      summary: "Đăng nhập",
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } } },
      responses: {
        200: {
          description: "Xác thực thành công, hệ thống trả về thông tin người dùng và token phiên đăng nhập.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
              example: {
                data: {
                  user: {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000001",
                    employeeCode: null,
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real.example",
                },
              },
            },
          },
        },
        401: {
          description: "Tài khoản hoặc mật khẩu không đúng, nên người dùng chưa được cấp phiên đăng nhập mới.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { message: "Tài khoản hoặc mật khẩu không đúng." },
            },
          },
        },
        403: {
          description: "Tài khoản đã nghỉ việc hoặc bị khóa, vì vậy không thể tạo session và không được phép truy cập hệ thống.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { message: "Tài khoản đã nghỉ việc hoặc bị khóa." },
            },
          },
        },
      },
    },
  },
  "/api/users/logout": {
    post: {
      tags: ["Users"],
      description: "Đăng xuất phiên hiện tại bằng cách thu hồi session đang dùng và xoá cookie xác thực trên trình duyệt. Sau khi gọi endpoint này, token cũ sẽ không còn dùng được nữa.",
      summary: "Đăng xuất",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Đăng xuất thành công",
          content: {
            "application/json": {
              example: {
                message: "Đăng xuất thành công",
              },
            },
          },
        },
      },
    },
  },
  "/api/users/all": {
    get: {
      tags: ["Users"],
      description: "Lấy toàn bộ danh sách nhân viên đã được nạp vào hệ thống, thường dùng cho màn hình quản trị, dropdown chọn người dùng và các chức năng tra cứu nội bộ.",
      summary: "Danh sách nhân viên",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Danh sách tất cả nhân viên",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedUsers" },
              example: {
                data: [
                  {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000005",
                    employeeCode: null,
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/users/department/{departmentId}": {
    get: {
      tags: ["Users"],
      description: "Lấy danh sách nhân viên thuộc một phòng ban cụ thể theo ID phòng ban. Endpoint này hỗ trợ các màn hình quản lý phòng ban, lọc nhân sự theo tổ chức và những form cần chọn thành viên trong cùng đơn vị.",
      summary: "Nhân viên theo phòng ban",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "departmentId", in: "path", required: true, schema: { type: "string", example: "10000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Danh sách người dùng trong phòng ban",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedUsers" },
              example: {
                data: [
                  {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000005",
                    employeeCode: null,
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/users/position/{positionId}": {
    get: {
      tags: ["Users"],
      description: "Lấy danh sách nhân viên có cùng chức vụ theo ID chức vụ. Thường dùng để lọc nhân sự theo cấp bậc/chức danh hoặc phục vụ logic phân công và báo cáo theo vị trí công việc.",
      summary: "Nhân viên theo chức vụ",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "positionId", in: "path", required: true, schema: { type: "string", example: "20000000-0000-4000-a000-000000000005" } }],
      responses: {
        200: {
          description: "Danh sách người dùng theo chức vụ",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedUsers" },
              example: {
                data: [
                  {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000005",
                    employeeCode: null,
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/users": {
    get: {
      tags: ["Users"],
      description: "Lấy danh sách người dùng có phân trang để phục vụ màn hình danh sách quản trị. Hỗ trợ hiển thị theo trang, giới hạn số bản ghi và dùng làm nguồn dữ liệu cho các thao tác bulk hoặc tìm kiếm nâng cao ở tầng giao diện.",
      summary: "Danh sách người dùng",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Danh sách người dùng phân trang",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedUsers" },
              example: {
                data: [
                  {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000005",
                    employeeCode: null,
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Users"],
      description: "Tạo mới một tài khoản nhân viên trong hệ thống. Khi tạo mới có thể điền đầy đủ thông tin hồ sơ, thông tin đăng nhập, vai trò, chức vụ, ngày vào làm và trạng thái làm việc; đây là endpoint dành cho khởi tạo nhân sự mới.",
      summary: "Tạo người dùng",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } } },
      responses: {
        201: {
          description: "Tạo người dùng thành công và trả về hồ sơ người dùng vừa khởi tạo.",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } },
              example: {
                data: {
                  id: "30000000-0000-4000-a000-000000000051",
                  departmentId: "10000000-0000-4000-a000-000000000001",
                  positionId: "20000000-0000-4000-a000-000000000005",
                  employeeCode: "EMP051",
                  name: "Trần Thị B",
                  email: "tranthib@qlpbda.com",
                  phone: "0912345678",
                  birthDate: "1999-07-10",
                  hireDate: "2026-01-01",
                  leaveDate: null,
                  gender: "female",
                  username: "tranthib",
                  role: "user",
                  status: true,
                  avatarURL: null,
                  lastLogin: null,
                  createdAt: "2026-08-04T08:30:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        409: {
          description: "Username đã tồn tại trong hệ thống nên không thể tạo tài khoản mới.",
          content: { "application/json": { example: { message: "Username đã tồn tại trong hệ thống." } } },
        },
      },
    },
  },
  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      description: "Lấy chi tiết hồ sơ của một nhân viên theo ID để hiển thị trang xem chi tiết, chuẩn bị form chỉnh sửa hoặc kiểm tra trạng thái tài khoản và thời gian làm việc.",
      summary: "Chi tiết người dùng",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", example: "30000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: {
          description: "Thông tin người dùng",
          content: {
            "application/json": {
              schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } },
              example: {
                data: {
                  id: "30000000-0000-4000-a000-000000000001",
                  departmentId: "10000000-0000-4000-a000-000000000001",
                  positionId: "20000000-0000-4000-a000-000000000005",
                  employeeCode: null,
                  name: "Nguyễn Văn Anh",
                  email: "nguyenvananh@qlpbda.com",
                  phone: "0901234567",
                  birthDate: "1998-03-21",
                  hireDate: "2023-06-01",
                  leaveDate: null,
                  gender: "male",
                  username: "root",
                  role: "admin",
                  status: true,
                  avatarURL: null,
                  lastLogin: null,
                  createdAt: "2026-01-01T08:00:00.000Z",
                  updatedAt: "2026-01-01T08:00:00.000Z",
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
      tags: ["Users"],
      description: "Cập nhật hồ sơ nhân viên theo ID, bao gồm thông tin cá nhân, thông tin công việc, ảnh đại diện, trạng thái tài khoản và ngày nghỉ việc. Endpoint này tự đồng bộ status/leaveDate theo rule của hệ thống để tránh dữ liệu mâu thuẫn.",
      summary: "Cập nhật người dùng",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } } },
      responses: {
        200: {
          description: "Cập nhật hồ sơ người dùng thành công và trả về dữ liệu mới nhất.",
          content: {
            "application/json": {
              example: {
                data: {
                  id: "30000000-0000-4000-a000-000000000051",
                  departmentId: "10000000-0000-4000-a000-000000000001",
                  positionId: "20000000-0000-4000-a000-000000000005",
                  employeeCode: "EMP051",
                  name: "Trần Thị B",
                  email: "tranthib@qlpbda.com",
                  phone: "0912345678",
                  birthDate: "1999-07-10",
                  hireDate: "2026-01-01",
                  leaveDate: null,
                  gender: "female",
                  username: "tranthib",
                  role: "user",
                  status: true,
                  avatarURL: null,
                  lastLogin: null,
                  createdAt: "2026-08-04T08:30:00.000Z",
                  updatedAt: "2026-08-04T08:30:00.000Z",
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy người dùng cần cập nhật.",
          content: { "application/json": { example: { message: "Không tìm thấy người dùng cần cập nhật." } } },
        },
      },
    },
    delete: {
      tags: ["Users"],
      description: "Vô hiệu hoá một người dùng theo ID, chuyển trạng thái sang nghỉ việc/bị khoá, ghi nhận leaveDate nếu chưa có và thu hồi toàn bộ phiên đăng nhập liên quan để đảm bảo tài khoản không còn truy cập được.",
      summary: "Vô hiệu hoá người dùng",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: {
          description: "Vô hiệu hoá thành công, trạng thái tài khoản đã được cập nhật theo rule leaveDate/status.",
          content: {
            "application/json": {
              example: {
                message: "Vô hiệu hoá thành công",
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy người dùng cần vô hiệu hoá.",
          content: { "application/json": { example: { message: "Không tìm thấy người dùng cần vô hiệu hoá." } } },
        },
      },
    },
  },
  "/api/users/updatePs": {
    patch: {
      tags: ["Users"],
      description: "Cho phép người dùng đang đăng nhập tự đổi mật khẩu bằng cách nhập mật khẩu hiện tại và mật khẩu mới. Đây là thao tác đổi mật khẩu nội bộ, không liên quan tới luồng quên mật khẩu qua email.",
      summary: "Đổi mật khẩu",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMeInput" } } } },
      responses: {
        200: {
          description: "Đổi mật khẩu cá nhân thành công.",
          content: {
            "application/json": {
              example: {
                message: "Đổi mật khẩu cá nhân thành công.",
              },
            },
          },
        },
      },
    },
  },
  "/api/users/forgot-password": {
    post: {
      tags: ["Users"],
      description: "Khởi tạo luồng quên mật khẩu bằng cách xác thực email và mã nhân viên, sau đó gửi mã xác nhận 6 số về email nếu thông tin hợp lệ.",
      summary: "Quên mật khẩu",
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordInput" } } } },
      responses: {
        200: {
          description: "Nếu email hợp lệ, hệ thống đã gửi mã xác nhận 6 số tới hộp thư tương ứng.",
          content: {
            "application/json": {
              example: {
                message: "Nếu email hợp lệ, hệ thống đã gửi mã xác nhận 6 số tới hộp thư tương ứng.",
              },
            },
          },
        },
        400: {
          description: "Email hoặc mã nhân viên không khớp nên không thể khởi tạo luồng quên mật khẩu.",
          content: { "application/json": { example: { message: "Email hoặc mã nhân viên không khớp." } } },
        },
      },
    },
  },
  "/api/users/reset-password": {
    post: {
      tags: ["Users"],
      description: "Đặt lại mật khẩu bằng mã xác nhận 6 số đã được gửi qua email. Endpoint này là bước tiếp theo của luồng quên mật khẩu và sẽ chỉ thành công khi mã còn hiệu lực.",
      summary: "Đặt lại mật khẩu",
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordInput" } } } },
      responses: {
        200: {
          description: "Đặt lại mật khẩu thành công và mã xác nhận đã được sử dụng.",
          content: {
            "application/json": {
              example: {
                message: "Đặt lại mật khẩu thành công và mã xác nhận đã được sử dụng.",
              },
            },
          },
        },
        400: {
          description: "Mã không hợp lệ, không khớp hoặc đã hết hạn.",
          content: { "application/json": { example: { message: "Mã không hợp lệ, không khớp hoặc đã hết hạn." } } },
        },
      },
    },
  },
  "/api/users/me/avatar": {
    post: {
      tags: ["Users"],
      description: "Tải ảnh đại diện mới của tài khoản hiện tại lên Cloudinary. File cũ sẽ được xoá đi để tránh để lại tài nguyên thừa trên hệ thống lưu trữ.",
      summary: "Cập nhật avatar",
      security: [{ cookieAuth: [] }],
      requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["avatar"], properties: { avatar: { type: "string", format: "binary" } } } } } },
      responses: {
        200: {
          description: "Cập nhật ảnh đại diện thành công và lưu URL mới vào hồ sơ người dùng.",
          content: {
            "application/json": {
              example: {
                message: "Cập nhật ảnh đại diện thành công và lưu URL mới vào hồ sơ người dùng.",
                data: {
                  avatarURL: "https://res.cloudinary.com/demo/image/upload/avatar-user.jpg",
                },
              },
            },
          },
        },
        400: {
          description: "Thiếu file hoặc định dạng file không hợp lệ.",
          content: { "application/json": { example: { message: "Thiếu file hoặc định dạng file không hợp lệ." } } },
        },
      },
    },
    delete: {
      tags: ["Users"],
      description: "Xoá ảnh đại diện của tài khoản hiện tại, đồng thời dọn file trên Cloudinary và đưa avatar về trạng thái null để ứng dụng dùng ảnh mặc định.",
      summary: "Xoá avatar",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Xoá ảnh đại diện thành công và đưa avatar về trạng thái mặc định.",
          content: {
            "application/json": {
              example: {
                message: "Xoá ảnh đại diện thành công và đưa avatar về trạng thái mặc định.",
              },
            },
          },
        },
      },
    },
  },
  "/api/users/search": {
    get: {
      tags: ["Users"],
      description: "Tìm kiếm nhân viên theo tên, email hoặc username. Endpoint này bị giới hạn cho Admin để tránh lộ dữ liệu nhân sự ngoài phạm vi quản trị.",
      summary: "Tìm kiếm nhân viên",
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: "q", in: "query", required: true, schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
      ],
      responses: {
        200: {
          description: "Trả về danh sách người dùng khớp từ khoá tìm kiếm, có phân trang.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedUsers" },
              example: {
                data: [
                  {
                    id: "30000000-0000-4000-a000-000000000001",
                    departmentId: "10000000-0000-4000-a000-000000000001",
                    positionId: "20000000-0000-4000-a000-000000000005",
                    employeeCode: "EMP001",
                    name: "Nguyễn Văn Anh",
                    email: "nguyenvananh@qlpbda.com",
                    phone: "0901234567",
                    birthDate: "1998-03-21",
                    hireDate: "2023-06-01",
                    leaveDate: null,
                    gender: "male",
                    username: "root",
                    role: "admin",
                    status: true,
                    avatarURL: null,
                    lastLogin: null,
                    createdAt: "2026-01-01T08:00:00.000Z",
                    updatedAt: "2026-01-01T08:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
        403: {
          description: "Không đủ quyền vì endpoint này chỉ dành cho Admin.",
          content: { "application/json": { example: { message: "Không đủ quyền vì endpoint này chỉ dành cho Admin." } } },
        },
      },
    },
  },
};
