export const projectCommentSchemas = {
  ProjectComment: {
    type: "object",
    example: {
      id: "70000000-0000-4000-a000-000000000001",
      projectId: "50000000-0000-4000-a000-000000000001",
      employeeId: "30000000-0000-4000-a000-000000000001",
      content: "Đã hoàn thành giai đoạn 1 - xây dựng xong giao diện cơ bản.",
      attachments: null,
      createdAt: "2025-06-15T00:00:00.000Z",
      updatedAt: "2025-06-15T00:00:00.000Z",
    },
    properties: {
      id: { type: "string", format: "uuid" },
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      content: { type: "string", nullable: true },
      attachments: { type: "string", nullable: true, description: "Chuỗi JSON chứa danh sách file đính kèm (URL Cloudinary)" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  ProjectCommentInput: {
    type: "object",
    required: ["projectId", "employeeId"],
    example: {
      projectId: "50000000-0000-4000-a000-000000000001",
      employeeId: "30000000-0000-4000-a000-000000000002",
      content: "Đã review xong giao diện, còn vài điểm cần tối ưu UX.",
      attachments: null,
    },
    properties: {
      projectId: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      content: { type: "string", description: "Nội dung bình luận — bắt buộc có content hoặc attachments" },
      attachments: { type: "string", description: "Chuỗi JSON danh sách file đính kèm (kết quả trả về từ /upload)" },
    },
  },
  UploadedFile: {
    type: "object",
    example: {
      originalName: "ke-hoach-mkt-q4.pdf",
      url: "https://res.cloudinary.com/demo/raw/upload/ke-hoach-mkt-q4.pdf",
      size: 1250000,
      mimetype: "application/pdf",
    },
    properties: {
      originalName: { type: "string" },
      url: { type: "string", description: "URL Cloudinary của file (image/raw)" },
      size: { type: "integer" },
      mimetype: { type: "string" },
    },
  },
};

const cmtAuth = { security: [{ cookieAuth: [] }] };

const cmtIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const projectCommentPaths = {
  "/api/project-comments": {
    get: {
      tags: ["Project Comments"],
      description: "Lấy danh sách tất cả bình luận mà người dùng có quyền xem. Endpoint này phù hợp cho màn hình kiểm duyệt, thống kê tương tác hoặc các view tổng hợp hoạt động trao đổi trong hệ thống.",
      summary: "Lấy danh sách bình luận",
      ...cmtAuth,
      responses: {
        200: { description: "Danh sách bình luận", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectComment" } } } } } } },
      },
    },
    post: {
      tags: ["Project Comments"],
      summary: "Tạo bình luận",
      description: "Bình luận phải có ít nhất content hoặc attachments.",
      ...cmtAuth,
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCommentInput" } } } },
      responses: {
        201: { description: "Tạo bình luận thành công", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectComment" } } } } } },
        400: { description: "Thiếu content lẫn attachments" },
      },
    },
  },
  "/api/project-comments/project/{projectId}": {
    get: {
      tags: ["Project Comments"],
      description: "Lấy các bình luận thuộc về một dự án cụ thể để hiển thị ở màn hình trao đổi của dự án hoặc luồng thảo luận theo công việc.",
      summary: "Lấy bình luận theo dự án",
      ...cmtAuth,
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "50000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: { description: "Danh sách bình luận của dự án", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectComment" } } } } } } },
      },
    },
  },
  "/api/project-comments/employee/{employeeId}": {
    get: {
      tags: ["Project Comments"],
      description: "Lấy toàn bộ bình luận do một nhân viên đăng để xem lịch sử trao đổi, dấu vết tham gia và mức độ đóng góp trong các dự án/task.",
      summary: "Lấy bình luận theo nhân viên",
      ...cmtAuth,
      parameters: [{ name: "employeeId", in: "path", required: true, schema: { type: "string", format: "uuid", example: "30000000-0000-4000-a000-000000000002" } }],
      responses: {
        200: { description: "Danh sách bình luận của nhân viên", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/ProjectComment" } } } } } } },
      },
    },
  },
  "/api/project-comments/upload": {
    post: {
      tags: ["Project Comments"],
      summary: "Upload file đính kèm lên Cloudinary",
      description:
        "Gửi tối đa 10 file (field name: files). Hỗ trợ ảnh, PDF, tài liệu Office, txt, zip... tối đa 50MB/file. " +
        "Trả về danh sách file với URL Cloudinary — dùng URL này đưa vào attachments khi tạo bình luận.",
      ...cmtAuth,
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["files"],
              properties: {
                files: { type: "array", items: { type: "string", format: "binary" }, description: "Tối đa 10 file" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Upload thành công", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/UploadedFile" } } } } } } },
        400: { description: "Định dạng file không được hỗ trợ hoặc vượt giới hạn 50MB" },
      },
    },
  },
  "/api/project-comments/{id}": {
    get: {
      tags: ["Project Comments"],
      description: "Lấy chi tiết một bình luận theo ID, bao gồm nội dung, file đính kèm, người tạo và thời điểm tạo/cập nhật.",
      summary: "Xem chi tiết bình luận",
      ...cmtAuth,
      parameters: [{ ...cmtIdParam, schema: { ...cmtIdParam.schema, example: "70000000-0000-4000-a000-000000000001" } }],
      responses: {
        200: { description: "Thông tin bình luận", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/ProjectComment" } } } } } },
        404: { description: "Không tìm thấy bình luận" },
      },
    },
    patch: {
      tags: ["Project Comments"],
      description: "Cập nhật nội dung hoặc danh sách file đính kèm của một bình luận hiện có. Dùng khi người dùng cần sửa lại nội dung trao đổi hoặc cập nhật tài liệu liên quan.",
      summary: "Cập nhật bình luận",
      ...cmtAuth,
      parameters: [cmtIdParam],
      requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCommentInput" } } } },
      responses: {
        200: { description: "Cập nhật thành công" },
        404: { description: "Không tìm thấy bình luận" },
      },
    },
    delete: {
      tags: ["Project Comments"],
      description: "Xoá một bình luận khỏi hệ thống theo ID. Thường dùng khi bình luận bị gửi nhầm, sai nội dung hoặc cần dọn dữ liệu không còn hợp lệ.",
      summary: "Xoá bình luận",
      ...cmtAuth,
      parameters: [cmtIdParam],
      responses: {
        200: { description: "Xoá bình luận thành công" },
      },
    },
  },
};
